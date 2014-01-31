#!/usr/bin/env python

from .ealgis import EAlGIS
from db import GeometryRelation, GeometryIntersection, GeometryTouches
import sys
import time
import random
import hashlib
import sqlalchemy

st_intersects = sqlalchemy.func.st_intersects
st_intersection = sqlalchemy.func.st_intersection
st_area = sqlalchemy.func.st_area
st_touches = sqlalchemy.func.st_touches

eal = EAlGIS()
proj_srid = int(eal.get_setting('projected_srid'))


def debug(s):
    sys.stderr.write(s)
    sys.stderr.flush()


class SnappedGeometry(object):
    gid_column = "gid"
    geom_column = "the_geom"

    def __init__(self, source, srid):
        debug("gridding " + source.table_info.name + ": ")
        self.table_name = self.make_gridded_temp(source, srid)
        debug("done\n")
        self.cls = eal.get_table_class(self.table_name)
        self.geom_attr = getattr(self.cls, SnappedGeometry.geom_column)
        self.gid_attr = getattr(self.cls, SnappedGeometry.gid_column)

    def get_cls(self):
        return self.cls

    def get_geom_attr(self):
        return self.geom_attr

    def get_gid_attr(self):
        return self.gid_attr

    def get_geom_column(self):
        return SnappedGeometry.geom_column

    def get_gid_column(self):
        return SnappedGeometry.gid_column

    def make_gridded_temp(self, source, srid):
        table_name = "%s_%s_tmp" % (
            source.table_info.name,
            hashlib.sha1("%s%g%g" % (source.table_info.name, random.random(), time.time())).hexdigest()[:8])
        cols = [
            eal.db.Column(SnappedGeometry.gid_column, eal.db.Integer, index=True, unique=True, primary_key=True),
        ]

        metadata = eal.db.MetaData()
        new_tbl = eal.db.Table(table_name, metadata, *cols, prefixes=[])
        metadata.create_all(eal.db.engine)
        eal.db.session.commit()
        del new_tbl

        eal.db.session.execute(
            sqlalchemy.func.addgeometrycolumn(
                table_name,
                SnappedGeometry.geom_column,
                srid,
                "GEOMETRY",
                2))
        eal.db.session.commit()

        eal.db.session.execute("""
            INSERT INTO %(tname)s (%(gid)s, %(geom)s)
            SELECT
                %(s_gid)s AS %(gid)s, %(s_geom)s AS %(geom)s
            FROM
                %(s_tname)s""" % {
            'tname': table_name,
            'gid': SnappedGeometry.gid_column,
            'geom': SnappedGeometry.geom_column,
            's_tname': source.table_info.name,
            's_gid': source.gid,
            's_geom': source.srid_column(srid)
        })
        eal.db.session.execute(
            "CREATE INDEX %s ON %s USING gist ( %s )" % (
                "%s_%s_gist" % (
                    table_name,
                    "the_geom"),
                table_name,
                "the_geom"))
        eal.db.session.commit()
        return table_name

    def drop(self):
        tbl = eal.get_table(self.table_name)
        tbl.drop(eal.db.engine)


class Relate(object):
    def __init__(self, source):
        self.source = source
        # for stability reasons we chuck the data onto a grid within our
        # projected SRID
        self.gridded = SnappedGeometry(source, proj_srid)

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self.gridded.drop()

    def __repr__(self):
        return "%s.%s" % (self.gridded.get_cls().__table__.name, self.gridded.get_geom_column())

    def get_source_id(self):
        return self.source.id

    def alias(self):
        r = sqlalchemy.orm.aliased(self.gridded.get_cls())
        return r, getattr(r, self.gridded.get_geom_column()), getattr(r, self.source.gid)

    def area(self, gid):
        return eal.db.session.query(
            st_area(self.gridded.get_geom_attr())).filter(self.gridded.get_gid_attr() == gid).one()[0]

    def gid_subquery(self, gid, lbl):
        return eal.db.session.query(
            self.gridded.get_geom_attr().label(lbl)).filter(self.gridded.get_gid_attr() == gid).subquery()


def find_intersections(left, right, left_relation, right_relation):
    left_alias, left_geom, left_gid_attr = left.alias()
    right_alias, right_geom, right_gid_attr = right.alias()
    q = eal.db.session.query(
        left_gid_attr,
        right_gid_attr,
        st_area(left_geom),
        st_area(right_geom),
        st_area(st_intersection(left_geom, right_geom))).filter(st_intersects(left_geom, right_geom))
    print 'intersecting: %s || %s' % (left, right)
    print q
    if left == right:
        print "overlap mode engaged"
        q = q.filter(left_gid_attr < right_gid_attr).filter(left_gid_attr != right_gid_attr)

    intersections = []

    def add_intersection(*args):
        intersections.append(args)
        sys.stderr.write("\r%d" % (len(intersections)))
        sys.stderr.flush()

    for left_gid, right_gid, left_area, right_area, intersection_area in q.yield_per(1):
        add_intersection(left_relation, left_gid, right_gid, left_area, intersection_area)
        add_intersection(right_relation, right_gid, left_gid, right_area, intersection_area)

    print
    print "committing %d intersections" % len(intersections)
    for idx, (relation, gid, with_gid, area, intersection_area) in enumerate(intersections):
        isect = GeometryIntersection(
            relation=relation,
            gid=gid,
            with_gid=with_gid,
            area_overlap=intersection_area,
            percentage_overlap=(intersection_area / area) * 100.)
        if (idx + 1) % 1000 == 0:
            eal.db.session.commit()  # cut memory usage
        eal.db.session.add(isect)
    eal.db.session.commit()


def find_touches(left, right, left_relation, right_relation):
    left_alias, left_geom, left_gid_attr = left.alias()
    right_alias, right_geom, right_gid_attr = right.alias()
    q = eal.db.session.query(
        left_gid_attr,
        right_gid_attr).filter(st_touches(left_geom, right_geom))
    print 'touching: %s || %s' % (left, right)
    print q
    if left == right:
        print "overlap mode engaged"
        q = q.filter(left_gid_attr < right_gid_attr).filter(left_gid_attr != right_gid_attr)
    touches = []

    def add_touch(*args):
        touches.append(args)
        sys.stderr.write("\r%d" % (len(touches)))
        sys.stderr.flush()

    for left_gid, right_gid in q.yield_per(1):
        add_touch(left_relation, left_gid, right_gid)
        add_touch(right_relation, right_gid, left_gid)

    print
    print "committing %d touches" % len(touches)
    for idx, (relation, gid, with_gid) in enumerate(touches):
        isect = GeometryTouches(
            relation=relation,
            gid=gid,
            with_gid=with_gid)
        if (idx + 1) % 1000 == 0:
            eal.db.session.commit()  # cut memory usage
        eal.db.session.add(isect)
    eal.db.session.commit()


def build_relations(left_source, right_source):
    def add_relation(f, t):
        existing = eal.get_geometry_relation(f.source, t.source)
        if existing is not None:
            print "deleting existing data"
            eal.db.session.query(GeometryIntersection).filter(
                GeometryIntersection.geometry_relation_id == existing.id).delete()
            eal.db.session.query(GeometryTouches).filter(
                GeometryTouches.geometry_relation_id == existing.id).delete()
            eal.db.session.commit()
            return existing
        rel = GeometryRelation(
            geo_source_id=f.source.id,
            overlaps_with_id=t.source.id)
        eal.db.session.add(rel)
        return rel

    def _build(left, right):
        left_relation = add_relation(left, right)
        if left != right:
            right_relation = add_relation(right, left)
        else:
            right_relation = left_relation
        find_intersections(left, right, left_relation, right_relation)
        find_touches(left, right, left_relation, right_relation)
    with Relate(left_source) as left:
        if left_source == right_source:
            _build(left, left)
        else:
            with Relate(right_source) as right:
                _build(left, right)
