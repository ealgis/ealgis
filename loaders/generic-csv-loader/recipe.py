import datetime
import json
import sys
import os

from ealgis_common.loaders import RewrittenCSV, CSVLoader
from ealgis_common.db import DataLoaderFactory
from ealgis_common.util import make_logger

tmpdir = "/tmp"

logger = make_logger(__name__)


class GenericCSVException(Exception):
    pass


class _GenericCSVMutator:
    gid_column = 'gid'

    def __init__(self, skip_rows, match_column, mapping):
        self.header_index = None
        self.skip_rows = skip_rows
        self.match_column = match_column
        self.mapping = mapping

    def mutate(self, line, row):
        if line < self.skip_rows:
            return None
        elif line == self.skip_rows:
            # header
            self.header = [column_name.lower() for column_name in row.copy()]
            self.header_index = row.index(self.match_column)
            self.header[self.header_index] = 'region_id'

            if self.gid_column in row:
                raise GenericCSVException("{} column already exists in input data".format(self.gid_column))
            # add a GID column
            return [self.gid_column] + self.header
        else:
            return [self.mapping[row[self.header_index]]] + row


class GenericCSVLoader:
    match_methods = {
        'str': str
    }

    def __init__(self, config_file):
        self.config_file = config_file
        with open(config_file, "r") as fd:
            self.config = json.load(fd)

        self.factory = DataLoaderFactory(db_name="ealgis", clean=False)
        self.mapping = self.build_geo_gid_mapping()

    def run(self):
        def gid_match(line, row):
            if line < skip:
                return None
            elif line == skip:
                header = row
                logger.debug(header)
                return header
            else:
                return row
            raise Exception()

        if os.path.exists(tmpdir) is False:
            os.makedirs(tmpdir)

        data_config = self.config['data']
        csv_config = data_config['csv']
        linkage = self.config['geometry_linkage']
        metadata_config = self.config['metadata']
        column_metadata_config = self.config['column_metadata'] if 'column_metadata' in self.config else None
        schema_config = self.config['schema'] if 'schema' in self.config else None

        if data_config['type'] != 'csv':
            raise Exception("Only CSV formatted data is supported at the moment.")

        skip = csv_config['skip']
        mutator = _GenericCSVMutator(csv_config['skip'], linkage['csv_column'], self.mapping)
        with self.factory.make_loader(schema_config['name']) as loader:
            target_table = data_config['db_table_name'].lower()
            if loader.is_table_registered(target_table) is True:
                raise Exception("Table '{}' is already registered in schema '{}'.".format(target_table, schema_config['name']))

            loader.add_dependency(linkage['shape_schema'])

            if schema_config is not None and loader.has_metadata() is False:
                loader.set_metadata(
                    name=metadata_config['collection_name'],
                    family=schema_config['title'],
                    description=schema_config['description'],
                    date_published=datetime.datetime.strptime(schema_config['date_published'], '%Y-%m-%d').date()
                )

            # normalise the CSV file by reading it in and writing it out again,
            # Postgres is quite pedantic. we also want to add an additional column to it
            file_path = os.path.join(os.path.dirname(self.config_file), data_config['file'])
            with RewrittenCSV(tmpdir, file_path, mutator.mutate, dialect=csv_config['dialect'], encoding=csv_config['encoding']) as norm:
                instance = CSVLoader(loader.dbschema(), target_table, norm.get(), pkey_column=0)
                instance.load(loader)

            with loader.access_schema(linkage['shape_schema']) as geo_access:
                shape_table = linkage['shape_table']
                geo_source = geo_access.get_geometry_source(shape_table)
                loader.add_geolinkage(
                    geo_access,
                    shape_table, geo_source.gid_column,
                    target_table, _GenericCSVMutator.gid_column)

                table_metadata = {
                    "type": metadata_config['title'],
                    "kind": metadata_config['kind'],
                    "family": metadata_config['family'],
                }
                if 'description' in metadata_config:
                    table_metadata['notes'] = metadata_config['description']
                loader.set_table_metadata(target_table, table_metadata)

                loader.register_columns(
                    target_table,
                    ((column_name, {
                        "type": column_metadata_config[column_name] if column_metadata_config is not None and column_name in column_metadata_config else column_name,
                        "kind": "Value"
                    }) for column_name in mutator.header if column_name != 'region_id')
                )
            return loader.result()

    def build_geo_gid_mapping(self):
        mapping = {}
        linkage = self.config['geometry_linkage']
        match_fn = self.match_methods[linkage['match']]
        with self.factory.make_schema_access(linkage['shape_schema']) as shape_access:
            shape_table = linkage['shape_table']
            geo_source = shape_access.get_geometry_source(shape_table)
            geo_cls = shape_access.get_table_class(shape_table)
            geo_column = getattr(geo_cls, linkage['shape_column'])
            gid_column = getattr(geo_cls, geo_source.gid_column)
            for gid, match_val in shape_access.session.query(gid_column, geo_column):
                match_val = match_fn(match_val)
                if match_val in mapping:
                    raise GenericCSVException("Shape mapping column has duplicate keys. Aborting.")
                mapping[match_val] = gid
        return mapping


def main():
    for arg in sys.argv[1:]:
        loader = GenericCSVLoader(sys.argv[1])
        result = loader.run()
        result.dump("/app/dump/")


if __name__ == '__main__':
    main()
