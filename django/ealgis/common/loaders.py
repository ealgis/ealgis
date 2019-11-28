import os.path
import hashlib
import zipfile
import sqlalchemy
import subprocess
import fnmatch
import glob
import re
import urllib.request
from shutil import rmtree
from urllib.parse import urlparse
from .util import table_name_valid, make_logger

from .seqclassifier import SequenceClassifier
import csv


logger = make_logger(__name__)


class LoaderException(Exception):
    pass


class DirectoryAccess(object):
    def __init__(self, directory):
        self._directory = directory

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        pass

    def getdir(self):
        return self._directory

    def get(self, filename):
        return os.path.join(self._directory, filename)

    def glob(self, pattern):
        return glob.glob(os.path.join(self.getdir(), pattern))


class ZipAccess(DirectoryAccess):
    def __init__(self, parent, tmpdir, zf_path):
        self._parent, self._tmpdir, self._zf_path = parent, tmpdir, zf_path
        self._unpacked = False
        dpath = os.path.join(self._tmpdir, hashlib.sha1(zf_path.encode('utf8')).hexdigest())
        super(ZipAccess, self).__init__(dpath)

    def _unpack(self):
        if self._parent is not None:
            zf_path = self._parent.get(self._zf_path)
        else:
            zf_path = self._zf_path
        with open(zf_path, 'rb') as fd:
            with zipfile.ZipFile(fd) as zf:
                zf.extractall(super().getdir())
        self._unpacked = True

    def getdir(self):
        if not self._unpacked:
            self._unpack()
        return super().getdir()

    def get(self, filename):
        if not self._unpacked:
            self._unpack()
        return super(ZipAccess, self).get(filename)

    def glob(self, filename):
        if not self._unpacked:
            self._unpack()
        return super(ZipAccess, self).glob(filename)

    def __exit__(self, type, value, traceback):
        if self._unpacked:
            rmtree(self._directory)
        return super(ZipAccess, self).__exit__(type, value, traceback)


class WebZipAccess(ZipAccess):
    def __init__(self, parent, tmpdir, url):
        self._parent, self._tmpdir, self._url = parent, tmpdir, url
        self._unpacked = False
        self._downloaded = False
        self._dlpath = os.path.join(self._tmpdir, hashlib.sha1(self._url.encode('utf8')).hexdigest())

    def _unpack(self):
        os.makedirs(self._dlpath)
        filename = os.path.basename(urlparse(self._url).path)
        zf_path, headers = urllib.request.urlretrieve(self._url, os.path.join(self._dlpath, filename))
        self._downloaded = True

        super().__init__(None, self._tmpdir, zf_path)
        return super()._unpack()

    def __exit__(self, type, value, traceback):
        if self._downloaded:
            rmtree(self._dlpath)
        return super().__exit__(type, value, traceback)


class RewrittenCSV(object):
    def __init__(self, tmpdir, csvpath, mutate_row_cb=None, dialect='excel', encoding='utf-8-sig'):
        def default_mutate(line, row):
            return row

        if mutate_row_cb is None:
            mutate_row_cb = default_mutate
        self._tmpdir = tmpdir
        self._path = os.path.join(self._tmpdir, hashlib.sha1(csvpath.encode('utf8')).hexdigest() + '.csv')
        with open(csvpath, 'r', encoding=encoding) as csv_in:
            with open(self._path, 'w') as csv_out:
                r = csv.reader(csv_in, dialect=dialect)

                def mutate_iter():
                    for line, row in enumerate(r):
                        mutated_row = mutate_row_cb(line, row)
                        if mutated_row is None:
                            continue
                        yield mutated_row

                w = csv.writer(csv_out)
                w.writerows(mutate_iter())

    def get(self):
        return self._path

    def __enter__(self):
        return self

    def __exit__(self, *args):
        os.unlink(self._path)


class GeoDataLoader(object):
    @classmethod
    def get_file_base(cls, fname):
        return os.path.splitext(fname)[0]

    @classmethod
    def generate_table_name(cls, base):
        table_name = os.path.splitext(os.path.basename(base))[0].replace(" ", "_").replace("-", '_')
        return table_name.lower()


class ShapeLoader(GeoDataLoader):
    @classmethod
    def prj_text(cls, shppath):
        # figure out srid code
        shpbase = ShapeLoader.get_file_base(shppath)
        try:
            with open(shpbase + '.prj') as prj:
                return prj.read()
        except IOError:
            return None

    def __init__(self, schema_name, shppath, srid, table_name=None):
        self.schema_name = schema_name
        self.shppath = shppath
        self.shpbase = ShapeLoader.get_file_base(shppath)
        self.shpname = os.path.basename(shppath)
        self.table_name = table_name or GeoDataLoader.generate_table_name(shppath)
        if not table_name_valid(self.table_name):
            raise LoaderException("table name is `%s' is invalid." % self.table_name)
        self.srid = srid

    def load(self, eal):
        ogr_cmd = [
            'ogr2ogr',
            '-f', 'postgresql',
            'PG:dbname=\'{}\' host=\'{}\' port=\'{}\' user=\'{}\' password=\'{}\''.format(
                eal.dbname(),
                eal.dbhost(),
                eal.dbport(),
                eal.dbuser(),
                eal.dbpassword()),
            self.shppath,
            '-nln', self.table_name,
            '-nlt', 'PROMOTE_TO_MULTI',
            '-lco', 'precision=NO',
            '-append',
            # Handle Shapefiles that don't have a .prj file
            '-a_srs', 'EPSG:{}'.format(self.srid),
            '-lco', 'fid=gid',
            '-lco', 'schema={}'.format(self.schema_name),
            '-lco', 'geometry_name=geom',
            # Getting "does not support layer creation option" errors from GDAL 2.4.0 for these layer creation options. Documentation states they were added in GDAL 1.10.0/1.11 though... *shrugs*
            # '-lco', '2GB_LIMIT=YES',
            # '-lco', 'RESIZE=YES',
        ]
        logger.debug(ogr_cmd)
        try:
            subprocess.check_call(ogr_cmd)
        except subprocess.CalledProcessError:
            raise LoaderException("load of %s failed." % self.shpname)
        # make the meta info
        logger.debug("registering, table name is: %s" % (self.table_name))
        eal.register_table(self.table_name, geom=True, srid=self.srid, gid='gid')


class GeoPackageLoader(GeoDataLoader):
    def __init__(self, schema_name, filename, layer_name, table_name=None):
        self.schema_name = schema_name
        self.filename = filename
        self.layer_name = layer_name
        self.table_name = table_name or GeoDataLoader.generate_table_name(self.get_file_base(filename))
        if not table_name_valid(self.table_name):
            raise LoaderException("table name is `%s' is invalid." % self.table_name)

    def load(self, eal):
        ogr_cmd = [
            'ogr2ogr',
            '-f', 'postgresql',
            'PG:dbname=\'{}\' host=\'{}\' port=\'{}\' user=\'{}\' password=\'{}\''.format(
                eal.dbname(),
                eal.dbhost(),
                eal.dbport(),
                eal.dbuser(),
                eal.dbpassword()),
            self.filename,
            '-nln', self.table_name,
            '-append',
            '-lco', 'fid=gid',
            '-lco', 'schema={}'.format(self.schema_name),
            '-lco', 'geometry_name=geom',
            self.layer_name
        ]
        logger.debug(ogr_cmd)
        try:
            subprocess.check_call(ogr_cmd)
        except subprocess.CalledProcessError:
            raise LoaderException("load of %s failed." % os.path.basename(self.filename))
        # make the meta info
        logger.debug("registering, table name is: %s" % (self.table_name))
        eal.register_table(self.table_name, geom=True, gid='gid')


class MapInfoLoader(GeoDataLoader):
    tab_re = re.compile(fnmatch.translate("*.tab"), re.IGNORECASE)
    mif_re = re.compile(fnmatch.translate("*.mif"), re.IGNORECASE)

    def __init__(self, schema_name, mipath, table_name=None):
        self.schema_name = schema_name
        self.filename = MapInfoLoader.get_filename(mipath)
        self.table_name = table_name or GeoDataLoader.generate_table_name(self.get_file_base(self.filename))
        if not table_name_valid(self.table_name):
            raise LoaderException("table name is `%s' is invalid." % self.table_name)

    @classmethod
    def get_filename(cls, mipath):
        "find the TAB of MIF file within the specified path, to be loaded"

        def one_match(glob_re, files):
            matches = [t for t in files if glob_re.match(t)]
            if len(matches) > 1:
                raise Exception("more than one MapInfo file in {}: {}".format(mipath, matches))
            elif len(matches) == 1:
                return os.path.join(mipath, matches[0])

        files = os.listdir(mipath)
        candidates = [s for s in [one_match(t, files) for t in (cls.mif_re, cls.tab_re)] if s]
        if len(candidates) > 1:
            raise Exception("more than one MapInfo file in {}: {}".format(mipath, candidates))
        elif len(candidates) == 1:
            return candidates[0]
        else:
            raise Exception("no mapinfo data found in {}: {}".format(mipath, files))

    def load(self, eal):
        ogr_cmd = [
            'ogr2ogr',
            '-f', 'postgresql',
            'PG:dbname=\'{}\' host=\'{}\' port=\'{}\' user=\'{}\' password=\'{}\''.format(
                eal.dbname(),
                eal.dbhost(),
                eal.dbport(),
                eal.dbuser(),
                eal.dbpassword()),
            self.filename,
            '-nln', self.table_name,
            '-lco', 'fid=gid',
            '-lco', 'schema={}'.format(self.schema_name),
            '-lco', 'geometry_name=geom',
        ]
        logger.debug(ogr_cmd)
        try:
            subprocess.check_call(ogr_cmd)
        except subprocess.CalledProcessError:
            raise LoaderException("load of %s failed." % os.path.basename(self.filename))
        # make the meta info
        logger.debug("registering, table name is: %s" % (self.table_name))
        eal.register_table(self.table_name, geom=True, gid='gid')


class KMLLoader(GeoDataLoader):
    def __init__(self, schema_name, filename, table_name=None):
        self.srid = 4326  # WGS84
        self.schema_name = schema_name
        self.filename = filename
        self.table_name = table_name or GeoDataLoader.generate_table_name(self.get_file_base(filename))
        if not table_name_valid(self.table_name):
            raise LoaderException("table name is `%s' is invalid." % self.table_name)

    def load(self, eal):
        ogr_cmd = [
            'ogr2ogr',
            '-f', 'postgresql',
            'PG:dbname=\'{}\' host=\'{}\' port=\'{}\' user=\'{}\' password=\'{}\''.format(
                eal.dbname(),
                eal.dbhost(),
                eal.dbport(),
                eal.dbuser(),
                eal.dbpassword()),
            self.filename,
            '-nln', self.table_name,
            '-append',
            '-lco', 'fid=gid',
            '-lco', 'schema={}'.format(self.schema_name),
            '-lco', 'geometry_name=geom',
        ]
        logger.debug(ogr_cmd)
        try:
            subprocess.check_call(ogr_cmd)
        except subprocess.CalledProcessError:
            raise LoaderException("load of %s failed." % os.path.basename(self.filename))
        # make the meta info
        logger.debug("registering, table name is: %s" % (self.table_name))
        eal.register_table(self.table_name, geom=True, srid=self.srid, gid='gid')


class CSVLoader(GeoDataLoader):
    def __init__(self, schema_name, table_name, csvpath, pkey_column=None):
        self.schema_name = schema_name
        self.table_name = table_name
        self.csvpath = csvpath
        self.pkey_column = pkey_column

    def load(self, loader, column_types=None):
        def get_column_types(header, max_rows=None):
            sql_columns = {
                int: sqlalchemy.types.Integer,
                float: sqlalchemy.types.Float,
                str: sqlalchemy.types.Text
            }
            if column_types is not None:
                return [sql_columns[t] for t in column_types]
            classifiers = [SequenceClassifier() for column in header]
            for i, row in enumerate(r):
                for classifier, value in zip(classifiers, row):
                    classifier.update(value)
                if max_rows is not None and i == max_rows:
                    break
            return [sql_columns[t.get()] for t in classifiers]

        def columns(header):
            coldefs = []
            for idx, (column_name, ty) in enumerate(zip(header, get_column_types(header))):
                make_index = idx == self.pkey_column
                coldefs.append(sqlalchemy.Column(
                    column_name.lower(),
                    ty,
                    index=make_index,
                    unique=make_index,
                    primary_key=make_index))
            return coldefs

        # smell the file, generate a SQLAlchemy table definition
        # and then make it
        with open(self.csvpath) as fd:
            r = csv.reader(fd)
            header = next(r)
            cols = columns(header)
        metadata = sqlalchemy.MetaData()
        new_tbl = sqlalchemy.Table(self.table_name, metadata, *cols, schema=self.schema_name)
        metadata.create_all(loader.engine)
        loader.session.commit()
        del new_tbl

        # invoke the Postgres CSV loader
        conn = loader.session.connection()
        conn.execute('COPY %s.%s FROM %%s CSV HEADER' % (self.schema_name, self.table_name), (self.csvpath, ))
        ti = loader.register_table(self.table_name)
        loader.session.commit()
        return ti
