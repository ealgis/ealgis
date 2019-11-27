#
# EAlGIS loader: Australian electorate boundaries
#

from ealgis.common.db import DataLoaderFactory
from ealgis.common.util import make_logger
from ealgis.common.loaders import ZipAccess, ShapeLoader, MapInfoLoader, KMLLoader, GeoPackageLoader
from datetime import datetime
import os.path


logger = make_logger(__name__)


def one(l):
    if len(l) == 0:
        raise Exception('one(): zero entries')
    elif len(l) > 1:
        raise Exception('one(): more than one entry (%s)' % repr(l))
    return l[0]


def load_shapes(factory, basedir, tmpdir):
    def load_mapinfo(table_name, filename):
        with ZipAccess(None, tmpdir, filename) as z:
            mipath = z.getdir() + '/'
            logger.debug([tmpdir, filename, mipath])
            instance = MapInfoLoader(loader.dbschema(), mipath, table_name=table_name)
            instance.load(loader)

    def load_shapefile(table_name, filename, srid):
        with ZipAccess(None, tmpdir, filename) as z:
            shpfile = one(z.glob('*.shp'))
            instance = ShapeLoader(loader.dbschema(), shpfile, srid, table_name=table_name)
            instance.load(loader)

    def load_kml(table_name, filename):
        instance = KMLLoader(loader.dbschema(), filename, table_name=table_name)
        instance.load(loader)

    def load_geopackage(table_name, filename, layer_name):
        with ZipAccess(None, tmpdir, filename) as z:
            gpkgfile = one(z.glob('*.gpkg'))
            instance = GeoPackageLoader(loader.dbschema(), gpkgfile, layer_name, table_name=table_name)
            instance.load(loader)

    FED_DESCR = 'Australian Federal Electorate Boundaries as at the %d election'
    WGS84 = 4326
    GDA94 = 4283
    shapes = {
        ('au_federal_electorate_boundaries', 'Australian Federal Electorate Boundaries (AEC)'): [
            ('federal_2001', FED_DESCR % 2001, 'Federal/COM_ELB_2001.zip', load_mapinfo, ()),
            ('federal_2004', FED_DESCR % 2004, 'Federal/COM_ELB_2004.zip', load_shapefile, (WGS84,)),
            ('federal_2007', FED_DESCR % 2007, 'Federal/COM_ELB_2007.zip', load_shapefile, (WGS84,)),
            ('federal_2010', FED_DESCR % 2010, 'Federal/national-esri-2010.zip', load_shapefile, (GDA94,)),
            ('federal_2013', FED_DESCR % 2013, 'Federal/national-esri-16122011.zip', load_shapefile, (GDA94,)),
            ('federal_2016', FED_DESCR % 2016, 'Federal/national-midmif-09052016.zip', load_mapinfo, ()),
            ('federal_2019', FED_DESCR % 2019, 'Federal/2019_election_federal_divisions.zip', load_shapefile, (GDA94,))
        ],
        ('au_wa_state_electorate_boundaries', 'Western Australian State Electorate Boundaries (EBWA)'): [
            ('wa_2011_la', 'Western Australian Legislative Assembly 2011', 'WA/2011/waec2011_final_boundaries.zip', load_shapefile, (WGS84,)),
            ('wa_2011_lc', 'Western Australian Legislative Council 2011', 'WA/2011/waec2011_final_boundaries_lc.zip', load_shapefile, (WGS84,)),
            ('wa_2015_la', 'Western Australian Legislative Assembly 2015', 'WA/2015/2015 Final Boundaries LA.zip', load_mapinfo, ()),
            ('wa_2015_lc', 'Western Australian Legislative Council 2015', 'WA/2015/2015 Final Boundaries LC.zip', load_mapinfo, ()),
        ],
        ('au_nsw_state_electorate_boundaries', 'New South Wales State Electorate Boundaries'): [
            ('nsw_2013', 'New South Wales State Boundaries 2013', 'NSW/2013/GIS_Files.zip', load_mapinfo, ()),
        ],
        ('au_qld_state_electorate_boundaries', 'Queensland State Electorate Boundaries'): [
            ('qld_2008', 'Queensland State Boundaries 2008', 'QLD/2008/qld_2008.zip', load_shapefile, (GDA94, )),
            ('qld_2017', 'Queensland State Boundaries 2017', 'QLD/2017/qld_2017.zip', load_shapefile, (GDA94, )),
        ],
        ('au_sa_state_electorate_boundaries', 'South Australian State Electorate Boundaries'): [
            ('sa_2010', 'South Australian State Boundaries 2010', 'SA/2010/StateElectorates2010_shp.zip', load_shapefile, (GDA94, )),
            ('sa_2014', 'South Australian State Boundaries 2014', 'SA/2014/StateElectorates_shp.zip', load_shapefile, (GDA94, )),
            ('sa_2018', 'South Australian State Boundaries 2018', 'SA/2018/StateElectorates2018_shp.zip', load_shapefile, (GDA94, )),
        ],
        ('au_vic_state_electorate_boundaries', 'Victorian State Electorate Boundaries'): [
            ('vic_2001_la', 'Victorian State Legislative Assembly Boundaries 2001', 'Vic/2001/vic_assembly_2001_aug10.zip', load_shapefile, (GDA94, )),
            ('vic_2005_lc', 'Victorian State Legislative Council Boundaries 2005', 'Vic/2005/vic_council_2005_aug10.zip', load_shapefile, (GDA94, )),
            ('vic_2013_la', 'Victorian State Legislative Assembly Boundaries 2013', 'Vic/2013/Final_DistrictBoundaries_region.zip', load_shapefile, (GDA94, )),
            ('vic_2013_lc', 'Victorian State Legislative Council Boundaries 2013', 'Vic/2013/Final_RegionBoundaries_region.zip', load_shapefile, (GDA94, )),
        ],
        ('au_nt_state_electorate_boundaries', 'Northern Territory Electorate Boundaries'): [
            ('nt_2015', 'Northern Territory Assembly Boundaries 2015', 'NT/2015 Redistribution Final Boundaries Segments.kml', load_kml, ()),
        ],
    }

    results = []
    for (schema_name, schema_description), to_load in shapes.items():
        with factory.make_loader(schema_name, mandatory_srids=[3112, 3857]) as loader:
            loader.set_metadata(
                name=schema_description,
                family="Australian Electorate Boundaries",
                date_published=datetime(2018, 5, 27, 0, 0, 0),  # Set in UTC
                description='Collected geometries from the relevant government authority')
            loader.session.commit()
            for table_name, description, zip_path, loader_fn, loader_args in to_load:
                loader_fn(table_name, os.path.join(basedir, zip_path), *loader_args)
                loader.set_table_metadata(table_name, {'description': description})
            results.append(loader.result())
    return results


def main():
    tmpdir = "/tmp"
    basedir = '/app/archive/australian-electorates/'
    factory = DataLoaderFactory(db_name="ealgis", clean=False)
    shape_results = load_shapes(factory, basedir, tmpdir)
    for result in shape_results:
        result.dump('/app/dump')


if __name__ == '__main__':
    main()
