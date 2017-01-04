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

    def have_table(self, table_name):
        try:
            self.get_table(table_name)
            return True
        except sqlalchemy.exc.NoSuchTableError:
            return False

    def get_table(self, table_name, schema_name):
        return sqlalchemy.Table(table_name, sqlalchemy.MetaData(), autoload=True, autoload_with=self.db.engine, schema=schema_name)

    def get_table_names(self):
        "get a list of the table names in a database. NB: this is *expensive memory wise* on a complex DB"
        metadata = self._get_metadata()
        rv = list(metadata.tables.keys())
        # can be HUGE
        del metadata
        return rv

    def get_table_class(self, table_name, schema_name):
        # nothing bad happens if there is a clash, but it produces
        # warnings
        nm = str('tbl_%s_%s' % (table_name, hashlib.sha1(str("%s%g%g" % (table_name, random.random(), time.time())).encode('utf-8')).hexdigest()[:8]))
        Base = declarative_base()
        return type(nm, (Base,), {'__table__': self.get_table(table_name, schema_name)})

    def is_compliant_schema(self, schema_name):
        """determines if a given schema is EAlGIS-compliant"""
        
        # Tables required for a schemas to be EAlGIS-compliant
        required_tables = ["table_info", "column_info", "geometry_linkage",
                            "geometry_source", "geometry_source_projected"]

        inspector = inspect(self.db)
        table_names = inspector.get_table_names(schema=schema_name)

        if not set(required_tables).issubset(table_names):
            return False
        
        # @TODO Do something with <version> later
        for table_name in table_names:
            match = re.match(r'^ealgis_metadata_v(?P<version>[0-9]+_[0-9])+$', table_name)
            if match is not None:
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

    def get_datainfo(self):
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

        def dump_source(source, tableinfo):
            if tableinfo.metadata_json is not None:
                source_info = json.loads(tableinfo.metadata_json)
            else:
                source_info = {'description': tableinfo.name}
            source_info['_id'] = source.id

            # source_info['tables'] = dict(dump_linkage(t) for t in source.linkages)
            source_info['type'] = source.geometry_type
            return source_info

        # def make_datainfo():
        #     # our geography sources
        #     info = {}
        #     for source in GeometrySource.query.all():
        #         name = source.table_info.name
        #         info[name] = dump_source(source)
        #     return info

        def make_datainfo():
            # our geography sources
            info = {}

            for schema_name in self.get_schemas():
                source = self.get_table_class("geometry_source", schema_name)
                tableinfo = self.get_table_class("table_info", schema_name)

                # @TODO Make this work using the inbuilt table relationships
                for source, tableinfo in self.session.\
                        query(source, tableinfo).\
                        filter(source.tableinfo_id == tableinfo.id).all():
                    name = "{}.{}".format(schema_name, tableinfo.name)
                    info[name] = dump_source(source, tableinfo)
            return info

        if self.datainfo is None:
            self.datainfo = make_datainfo()
        return self.datainfo