import os.path
import hashlib
import zipfile
import sqlalchemy
import subprocess
import glob
from util import piperun, table_name_valid
from itertools import izip
from seqclassifier import SequenceClassifier
import osr
import sys
import csv


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
                zf.extractall(self.getdir())
        self._unpacked = True

    def get(self, filename):
        if not self._unpacked:
            self._unpack()
        return super(ZipAccess, self).get(filename)

    def glob(self, filename):
        if not self._unpacked:
            self._unpack()
        return super(ZipAccess, self).glob(filename)

    def __exit__(self, type, value, traceback):
        return super(ZipAccess, self).__exit__(type, value, traceback)


class RewrittenCSV(object):
    def __init__(self, tmpdir, csvpath, mutate_row_cb=None):
        if mutate_row_cb is None:
            mutate_row_cb = lambda line, row: row
        self._tmpdir = tmpdir
        self._path = os.path.join(self._tmpdir, hashlib.sha1(csvpath.encode('utf8')).hexdigest() + '.csv')
        with open(csvpath, 'r') as csv_in:
            with open(self._path, 'w') as csv_out:
                r = csv.reader(csv_in)
                w = csv.writer(csv_out)
                w.writerows((mutate_row_cb(line, row) for (line, row) in enumerate(r)))

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

    @classmethod
    def auto_srid(cls, prj_text):
        if prj_text is None:
            return None
        srs = osr.SpatialReference()
        srs.ImportFromESRI([prj_text])
        srs.AutoIdentifyEPSG()
        auto_srid = srs.GetAuthorityCode(None)
        if auto_srid is not None:
            auto_srid = int(auto_srid)
        return auto_srid

    def __init__(self, shppath, srid=None, table_name=None):
        self.shppath = shppath
        self.shpbase = ShapeLoader.get_file_base(shppath)
        self.shpname = os.path.basename(shppath)
        self.table_name = table_name or GeoDataLoader.generate_table_name(shppath)
        if not table_name_valid(self.table_name):
            raise LoaderException("table name is `%s' is invalid." % self.table_name)
        prj_text = ShapeLoader.prj_text(shppath)
        auto_srid = ShapeLoader.auto_srid(prj_text)
        if srid is None:
            srid = auto_srid
        if srid is None:
            print >>sys.stderr, "can't determine srid for `%s'" % (self.shpname)
            print >>sys.stderr, "prj text: %s" % prj_text
            raise LoaderException()
        elif auto_srid is not None and srid != auto_srid:
            print >>sys.stderr, "warning: auto srid (%s) does not match provided srid (%s) for `%s'" % (auto_srid, srid, self.shpname)
        self.srid = srid

    def load(self, eal):
        if eal.have_table(self.table_name):
            print "already loaded: %s" % (self.table_name)
            return
        shp_cmd = ['shp2pgsql', '-s', str(self.srid), '-I', self.shppath, self.table_name]
        os.environ['PGPASSWORD'] = eal.dbpassword()
        _, _, code = piperun(shp_cmd, [
            'psql',
            '-h', eal.dbhost(),
            '-U', eal.dbuser(),
            '-p', str(eal.dbport()),
            '-q', eal.dbname()])
        if code != 0:
            raise LoaderException("load of %s failed." % self.shpname)
        # make the meta info
        print "registering, table name is:", self.table_name
        eal.register_table(self.table_name, geom=True, srid=self.srid, gid='gid')


class MapInfoLoader(GeoDataLoader):
    def __init__(self, filename, srid, table_name=None):
        self.filename = filename
        self.srid = srid
        self.table_name = table_name or GeoDataLoader.generate_table_name(MapInfoLoader.get_file_base(filename))
        if not table_name_valid(self.table_name):
            raise LoaderException("table name is `%s' is invalid." % self.table_name)

    def load(self, eal):
        if eal.have_table(self.table_name):
            print "already loaded: %s" % (self.table_name)
            return
        ogr_cmd = [
            'ogr2ogr',
            '-f', 'postgresql',
            'pg:dbname=%s' % (eal.dbname()),
            self.filename,
            '-nln', self.table_name,
            '-lco', 'fid=gid']
        print >>sys.stderr, ogr_cmd
        try:
            subprocess.check_call(ogr_cmd)
        except subprocess.CalledProcessError:
            raise LoaderException("load of %s failed." % os.path.basename(self.filename))
        # make the meta info
        print "registering, table name is:", self.table_name
        eal.register_table(self.table_name, geom=True, srid=self.srid, gid='gid')


class KMLLoader(GeoDataLoader):
    def __init__(self, filename, srid, table_name=None):
        self.filename = filename
        self.srid = srid
        self.table_name = table_name or GeoDataLoader.generate_table_name(MapInfoLoader.get_file_base(filename))
        if not table_name_valid(self.table_name):
            raise LoaderException("table name is `%s' is invalid." % self.table_name)

    def load(self, eal):
        if eal.have_table(self.table_name):
            print "already loaded: %s" % (self.table_name)
            return
        ogr_cmd = [
            'ogr2ogr',
            '-f', 'postgresql',
            'pg:dbname=%s' % (eal.dbname()),
            self.filename,
            '-nln', self.table_name,
            '-append',
            '-lco', 'fid=gid']
        print >>sys.stderr, ogr_cmd
        try:
            subprocess.check_call(ogr_cmd)
        except subprocess.CalledProcessError:
            raise LoaderException("load of %s failed." % os.path.basename(self.filename))
        # delete any pins or whatever
        cls = eal.get_table_class(self.table_name)
        for obj in eal.db.session.query(cls).filter(sqlalchemy.func.geometrytype(cls.wkb_geometry)!='MULTIPOLYGON'):
            eal.db.session.delete(obj)
        eal.db.session.commit()
        # make the meta info
        print "registering, table name is:", self.table_name
        eal.register_table(self.table_name, geom=True, srid=self.srid, gid='gid')


class CSVLoader(GeoDataLoader):
    def __init__(self, table_name, csvpath, pkey_column=None):
        self.table_name = table_name
        self.csvpath = csvpath
        self.pkey_column = pkey_column

    def load(self, eal, column_types=None):
        db = eal.db

        def get_column_types(header, max_rows=None):
            sql_columns = {
                int: db.Integer,
                float: db.Float,
                str: db.Text
            }
            if column_types is not None:
                return [sql_columns[t] for t in column_types]
            classifiers = [SequenceClassifier() for column in header]
            for i, row in enumerate(r):
                for classifier, value in izip(classifiers, row):
                    classifier.update(value)
                if max_rows is not None and i == max_rows:
                    break
            return [sql_columns[t.get()] for t in classifiers]

        def columns(header):
            coldefs = []
            for idx, (column_name, ty) in enumerate(izip(header, get_column_types(header))):
                make_index = idx == self.pkey_column
                coldefs.append(db.Column(
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
        metadata = eal.db.MetaData()
        new_tbl = db.Table(self.table_name, metadata, *cols)
        metadata.create_all(eal.db.engine)
        eal.db.session.commit()
        del new_tbl

        # this isn't wrapped by SQLAlchemy, so we must do it ourselves;
        # invoke the Postgres CSV loader
        conn = db.session.connection()
        conn.execute('COPY %s FROM %%s CSV HEADER' % (self.table_name), (self.csvpath, ))
        ti = eal.register_table(self.table_name)
        db.session.commit()
        return ti
