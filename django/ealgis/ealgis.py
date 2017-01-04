import sys
import os
import time
import random

# from django.db import connection
from sqlalchemy import create_engine, inspect
import re

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
    
    def scan_schemas(self, skip_cache=False):
        """identify and load EAlGIS-compliant schemas available in the database"""

        def get_schemas():
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
            self.schemas = get_schemas()
        return self.schemas