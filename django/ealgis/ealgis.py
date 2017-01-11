try:
    import simplejson as json
except ImportError:
    import json
import sys
import os
import hashlib
import time
import random
import re

import ealgis.models as models
import sqlalchemy as sqlalchemy
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, subqueryload
from sqlalchemy.ext.declarative import declarative_base
from django.apps import apps

class NoMatches(Exception):
    pass


class TooManyMatches(Exception):
    pass


class CompilationError(Exception):
    pass

class EAlGIS(object):
    "singleton with key application (eg. database connection) state"
    # pattern credit: http://stackoverflow.com/questions/42558/python-and-the-singleton-pattern
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(EAlGIS, cls).__new__(cls, *args, **kwargs)
            cls._instance._made = False
        return cls._instance

    def __init__(self):
        # don't want to construct multiple times
        if self._made:
            return
        self._made = True

        self.db = create_engine(self._connection_string())
        Session = sessionmaker()
        Session.configure(bind=self.db)
        self.session = Session()

        self.schemas = None
        self.datainfo = None

    def _connection_string(self):
        # try and autoconfigure for running under docker
        dbuser = os.environ.get('DB_USERNAME')
        dbpassword = os.environ.get('DB_PASSWORD')
        dbhost = os.environ.get('DB_HOST')
        dbport = os.environ.get('DB_PORT')
        dbname = os.environ.get('DB_NAME')
        if dbuser and dbpassword and dbhost:
            return 'postgres://%s:%s@%s:%s/%s' % (dbuser, dbpassword, dbhost, dbport, dbname)
        return 'postgres:///ealgis'

    def get_table_classes(self, table_names, schema_name):
        """
        required for cases like eal.resolve_attribute() where one query needs to join
        across multiple tables from the same Base
        """
        from sqlalchemy.ext.automap import automap_base
        metadata = sqlalchemy.MetaData()

        onlylist = ["table_info", "column_info", "geometry_source_projected", "geometry_source", "geometry_linkage"]
        for table_name in table_names:
            if table_name not in onlylist:
                onlylist.append(table_name)

        metadata.reflect(bind=self.db.engine, only=onlylist, schema=schema_name)
        b = automap_base(metadata=metadata)
        b.prepare()

        return [b.classes[t] for t in table_names]

    def get_table_class(self, table_name, schema_name):
        """
        use SQLAlchemy's automap magic to reflect a table on-the-fly
        saves having to reflect all tables on startup (the census alone us ~5,000 tables!)
        """
        return self.get_table_classes([table_name], schema_name)[0]

    def is_compliant_schema(self, schema_name):
        """determines if a given schema is EAlGIS-compliant"""
        
        # Tables required for a schemas to be EAlGIS-compliant
        required_tables = ["table_info", "column_info", "geometry_linkage",
                            "geometry_source", "geometry_source_projected"]

        inspector = inspect(self.db)
        table_names = inspector.get_table_names(schema=schema_name)

        if not set(required_tables).issubset(table_names):
            return False
        
        if "ealgis_metadata" in table_names:
            return True
        
        return False
    
    def get_schemas(self, skip_cache=False):
        """identify and load EAlGIS-compliant schemas available in the database"""

        def make_schemas():
            print("Scanning!")
            # PostgreSQL and PostGIS system schemas
            system_schemas = ["information_schema", "tiger", "tiger_data", "topology", "public"]

            inspector = inspect(self.db)

            schemas = []
            for schema_name in inspector.get_schema_names():
                if schema_name not in system_schemas:
                    if self.is_compliant_schema(schema_name):
                        schemas.append(schema_name)
            return schemas
        
        if skip_cache is True or self.schemas is None:
            self.schemas = make_schemas()
        return self.schemas

    def get_datainfo(self, only_spatial=True):
        """grab a representation of the data available in the database
        result is cached, so after first call this is fast"""

        # def dump_linkage(linkage):
        #     name = linkage.attribute_table.name
        #     if linkage.attribute_table.metadata_json is not None:
        #         obj = json.loads(linkage.attribute_table.metadata_json)
        #     else:
        #         obj = {}
        #     obj['_id'] = linkage.id
        #     return name, obj

        def dump_source(source):
            if source.table_info.metadata_json is not None:
                source_info = json.loads(source.table_info.metadata_json)
            else:
                source_info = {'description': source.table_info.name}
            source_info['_id'] = source.id

            # source_info['tables'] = dict(dump_linkage(t) for t in source.linkages)
            source_info['geometry_type'] = source.geometry_type
            source_info['name'] = source.table_info.name
            source_info['schema_name'] = source.__table__.schema
            return source_info
        
        def dump_table_info(table):
            if table.metadata_json is not None:
                table_info = json.loads(table.metadata_json)
            else:
                table_info = {'description': table.name}
            table_info['_id'] = table.id

            table_info['name'] = table.name
            table_info['schema_name'] = table.__table__.schema
            return table_info

        def make_datainfo():
            # our geography sources
            info = {}

            for schema_name in self.get_schemas():
                geometrysource, tableinfo =  self.get_table_classes(["geometry_source", "table_info"], schema_name)

                for source in self.session.query(geometrysource).all():
                    name = "{}.{}".format(schema_name, source.table_info.name)
                    info[name] = dump_source(source)
                
                if only_spatial == False:
                    for table_info in self.session.query(tableinfo).all():
                        name = "{}.{}".format(schema_name, table_info.name)
                        if name not in info:
                            info[name] = dump_table_info(table_info)
            return info

        if self.datainfo is None:
            self.datainfo = make_datainfo()
        return self.datainfo
    
    def get_table_info(self, table_name, schema_name):
        tableinfo = self.get_table_class("table_info", schema_name)
        return self.session.query(tableinfo).filter_by(name=table_name).first()

    def get_geometry_source(self, table_name, schema_name):
        geometrysource, tableinfo =  self.get_table_classes(["geometry_source", "table_info"], schema_name)
        return self.session.query(geometrysource).join(geometrysource.table_info).filter(tableinfo.name == table_name).one()

    def get_geometry_source_by_id(self, id, schema_name):
        geometrysource = eal.get_table_class("geometry_source", schema_name)
        return self.query(geometrysource).filter(geometrysource.id == id).one()

    def resolve_attribute(self, geometry_source, attribute):
        attribute = attribute.lower()  # upper case tables or columns seem unlikely, but a possible FIXME
        # supports table_name.column_name OR just column_name
        s = attribute.split('.', 1)

        ColumnInfo, GeometryLinkage, TableInfo =  self.get_table_classes(["column_info", "geometry_linkage", "table_info"], geometry_source.__table__.schema)

        q = self.session.query(ColumnInfo, GeometryLinkage.id).join(TableInfo).join(GeometryLinkage)
        if len(s) == 2:
            q = q.filter(TableInfo.name == s[0])
            attr_name = s[1]
        else:
            attr_name = s[0]
        q = q.filter(GeometryLinkage.geometry_source == geometry_source).filter(ColumnInfo.name == attr_name)
        matches = q.all()
        if len(matches) > 1:
            raise TooManyMatches(attribute)
        elif len(matches) == 0:
            raise NoMatches(attribute)
        else:
            ci, linkage_id = matches[0]
            return self.session.query(GeometryLinkage).get(linkage_id), ci