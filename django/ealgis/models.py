import sqlalchemy as db
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import relationship, backref
import datetime

Base = automap_base()


class TableInfo(Base):
    "metadata for each table that has been loaded into the system"
    __tablename__ = 'table_info'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), unique=True, index=True)
    geometry_source = relationship(
        'GeometrySource',
        backref=backref('table_info'),
        cascade="all",
        uselist=False)
    column_info = relationship(
        'ColumnInfo',
        backref=backref('table_info'),
        cascade="all",
        lazy='dynamic')
    linkages = relationship(
        'GeometryLinkage',
        backref=backref('attribute_table'),
        cascade="all",
        lazy='dynamic')
    metadata_json = db.Column(db.JSON())


class ColumnInfo(Base):
    "metadata for columns in the tabbles"
    __tablename__ = 'column_info'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), index=True)
    tableinfo_id = db.Column(db.Integer, db.ForeignKey('table_info.id'), index=True, nullable=False)
    metadata_json = db.Column(db.JSON())
    __table_args__ = (db.UniqueConstraint('name', 'tableinfo_id'), )


class GeometrySourceProjected(Base):
    "details of an additional column (on the same table as the source) with the source reprojected to this srid"
    __tablename__ = 'geometry_source_projected'
    id = db.Column(db.Integer, primary_key=True)
    geometry_source_id = db.Column(db.Integer, db.ForeignKey('geometry_source.id'), index=True, nullable=False)
    srid = db.Column(db.Integer, nullable=False)
    column = db.Column(db.String(256), nullable=False)


class GeometrySource(Base):
    "table describing sources of geometry information: the table, and the column"
    __tablename__ = 'geometry_source'
    id = db.Column(db.Integer, primary_key=True)
    tableinfo_id = db.Column(db.Integer, db.ForeignKey('table_info.id'), index=True, nullable=False)
    geometry_type = db.Column(db.String(256), nullable=False)
    column = db.Column(db.String(256), nullable=False)
    srid = db.Column(db.Integer, nullable=False)
    gid = db.Column(db.String(256), nullable=False)
    linkages = relationship(
        'GeometryLinkage',
        backref=backref('geometry_source'),
        cascade="all",
        lazy='dynamic')
    reprojections = relationship(
        'GeometrySourceProjected',
        backref=backref('geometry_source'),
        cascade="all",
        lazy='dynamic')
    from_relations = relationship(
        'GeometryRelation',
        backref=backref('geometry_source'),
        cascade="all",
        lazy='dynamic',
        foreign_keys="[GeometryRelation.geo_source_id]")
    with_relations = relationship(
        'GeometryRelation',
        backref=backref('overlaps_geometry_source'),
        cascade="all",
        lazy='dynamic',
        foreign_keys="[GeometryRelation.overlaps_with_id]")

    def __repr__(self):
        return "GeometrySource<%s.%s>" % (self.table_info.name, self.column)


class GeometrySourceColumn(Base):
    "table describing sources of geometry information: the table, and the column"
    __tablename__ = 'geometry_source_column'
    id = db.Column(db.Integer, primary_key=True)
    geometry_source_id = db.Column(db.Integer, db.ForeignKey('geometry_source.id'), index=True, nullable=False)
    column = db.Column(db.String(256), nullable=False)
    srid = db.Column(db.Integer, nullable=False)


class GeometryLinkage(Base):
    "details of links to tie attribute data to columns in a geometry table"
    __tablename__ = 'geometry_linkage'
    id = db.Column(db.Integer, primary_key=True)
    # the geometry table, and the column which links a row in our attribute table with
    # a row in the geometry table
    geometry_source_id = db.Column(db.Integer, db.ForeignKey('geometry_source.id'), index=True, nullable=False)
    geo_column = db.Column(db.String(256))
    # the attribute table, and the column which links a row in our geomtry table with
    # a row in the attribute table
    table_info_id = db.Column(db.Integer, db.ForeignKey('table_info.id'), nullable=False)
    attr_column = db.Column(db.String(256))


class GeometryIntersection(Base):
    "intersection of two priority geometries, indexed by gids from their source columns"
    __tablename__ = 'geometry_intersection'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    geometry_relation_id = db.Column(db.Integer, db.ForeignKey('geometry_relation.id'), index=True, nullable=False)
    gid = db.Column(db.Integer, index=True, nullable=False)
    with_gid = db.Column(db.Integer, index=True, nullable=False)
    percentage_overlap = db.Column(db.Float, nullable=False)
    area_overlap = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return "<%d,%d>: %.2f%%" % (
            self.gid,
            self.with_gid,
            self.percentage_overlap)


class GeometryTouches(Base):
    "geometries that touch but do not overlap"
    __tablename__ = 'geometry_touches'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    geometry_relation_id = db.Column(db.Integer, db.ForeignKey('geometry_relation.id'), index=True, nullable=False)
    gid = db.Column(db.Integer, index=True, nullable=False)
    with_gid = db.Column(db.Integer, index=True, nullable=False)

    def __repr__(self):
        return "<%d,%d>" % (
            self.gid,
            self.with_gid)


class GeometryRelation(Base):
    "relationship of geometries; eg. one row in a geometry table with another row in another table (possibly the same table)"
    __tablename__ = 'geometry_relation'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    geo_source_id = db.Column(db.Integer, db.ForeignKey('geometry_source.id'), nullable=False)
    overlaps_with_id = db.Column(db.Integer, db.ForeignKey('geometry_source.id'), nullable=False)
    intersections = relationship(
        'GeometryIntersection',
        cascade="all",
        backref=backref('relation'),
        lazy='dynamic')
    touches = relationship(
        'GeometryTouches',
        cascade="all",
        backref=backref('relation'),
        lazy='dynamic')
    __table_args__ = (
        db.UniqueConstraint('geo_source_id', 'overlaps_with_id'),
        db.Index('georelation_lookup', geo_source_id, overlaps_with_id))


class EALGISMetadata(Base):
    "metadata table for a given set of datasets in a schema"
    __tablename__ = 'ealgis_metadata'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256))
    family = db.Column(db.String(256))
    uuid = db.Column(db.String(256))
    # version = db.Column(db.Float())
    description = db.Column(db.Text())
    date_created = db.Column(db.DateTime(timezone=True), default=datetime.datetime.utcnow)
