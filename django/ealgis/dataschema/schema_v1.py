from sqlalchemy.schema import (
    Table,
    Column,
    MetaData,
    ForeignKey)
from sqlalchemy.types import (
    Text,
    JSON,
    DateTime,
    Integer,
    String)
from collections import defaultdict
from uuid import uuid4
import datetime


class SchemaStore:
    def __init__(self):
        self.metadata = defaultdict(MetaData)
        self.tables = defaultdict(list)

    def _import_schema(self, schema_name):
        def fkey(target):
            return ForeignKey(schema_name + '.' + target)

        def make_uuid():
            return str(uuid4())

        metadata = self.metadata[schema_name]
        tables = self.tables[schema_name]
        tables.append(Table(
            "ealgis_metadata", metadata,
            Column('id', Integer, primary_key=True),
            Column('name', String(256), nullable=False),
            Column('family', String(256), nullable=True),
            Column('uuid', String(36), nullable=False, default=make_uuid),
            Column('description', Text(), nullable=False),
            Column('date_created', DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False),
            Column('date_published', DateTime(timezone=True), nullable=False),
            schema=schema_name))
        tables.append(Table(
            "dependencies", metadata,
            Column('id', Integer, primary_key=True),
            Column('name', String(256), nullable=False),
            Column('uuid', String(36), nullable=False),
            schema=schema_name))
        tables.append(Table(
            "table_info", metadata,
            Column('id', Integer, primary_key=True),
            Column('name', String(256)),
            Column('metadata_json', JSON()),
            schema=schema_name))
        tables.append(Table(
            "column_info", metadata,
            Column('id', Integer, primary_key=True),
            Column('table_info_id', Integer, fkey('table_info.id'), nullable=False),
            Column('name', String(256)),
            Column('schema_name', String(256)),
            Column('metadata_json', JSON()),
            schema=schema_name))
        tables.append(Table(
            "geometry_source", metadata,
            Column('id', Integer, primary_key=True),
            Column('table_info_id', Integer, fkey('table_info.id'), nullable=False),
            Column('gid_column', String(256)),
            Column('geometry_type', String(256)),
            schema=schema_name))
        tables.append(Table(
            "geometry_source_projection", metadata,
            Column('id', Integer, primary_key=True),
            Column('geometry_source_id', Integer, fkey('table_info.id'), nullable=False),
            Column('geometry_column', String(256)),
            Column('srid', Integer),
            schema=schema_name))

        tables.append(Table(
            "geometry_linkage", metadata,
            Column('id', Integer, primary_key=True),
            # in the source schema: may not be the same schema as this Table instance
            Column('geometry_source_schema_name', String, nullable=False),
            Column('geometry_source_id', Integer, nullable=False),
            # these must be in this schema
            Column('attr_table_id', Integer, fkey('table_info.id'), nullable=False),
            Column('attr_column', String(256)),
            schema=schema_name))
        tables.append(Table(
            "mailbox", metadata,
            Column('id', Integer, primary_key=True),
            Column('from', String(256)),
            Column('to', String(256)),
            Column('message', JSON()),
            schema=schema_name))

    def load_schema(self, schema_name):
        if schema_name not in self.metadata:
            self._import_schema(schema_name)
        return self.metadata[schema_name], self.tables[schema_name]


store = SchemaStore()
