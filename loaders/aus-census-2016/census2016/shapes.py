#!/usr/bin/env python

#
# EAlGIS loader: Australian Census 2016; Data Pack 1
#

from ealgis.common.loaders import ZipAccess, ShapeLoader
from ealgis.common.util import make_logger
import os
import os.path
import sqlalchemy
from datetime import datetime


logger = make_logger(__name__)
SHAPE_SCHEMA = 'aus_census_2016_shapes'
SHAPE_ZIPS = [
    ('ced', '2016_CED_shape.zip'),
    ('gccsa', '2016_GCCSA_shape.zip'),
    ('iare', '2016_IARE_shape.zip'),
    ('iloc', '2016_ILOC_shape.zip'),
    ('ireg', '2016_IREG_shape.zip'),
    ('lga', '2016_LGA_shape.zip'),
    ('poa', '2016_POA_shape.zip'),
    ('ra', '2016_RA_shape.zip'),
    ('sa1', '2016_SA1_shape.zip'),
    ('sa2', '2016_SA2_shape.zip'),
    ('sa3', '2016_SA3_shape.zip'),
    ('sa4', '2016_SA4_shape.zip'),
    ('sed', '2016_SED_shape.zip'),
    ('sos', '2016_SOS_shape.zip'),
    ('sosr', '2016_SOSR_shape.zip'),
    ('ssc', '2016_SSC_shape.zip'),
    ('ste', '2016_STE_shape.zip'),
    ('sua', '2016_SUA_shape.zip'),
    ('ucl', '2016_UCL_shape.zip'),
]
SHAPE_LINKAGE = {
    'ced': ('ced_code', None, 'Commonwealth Electoral Division'),
    'gccsa': ('gccsa_code', None, 'Greater Capital City Statistical Areas'),
    'iare': ('iare_code', None, 'Indigenous Area'),
    'iloc': ('iloc_code', None, 'Indigenous Location'),
    'ireg': ('ireg_code', None, 'Indigenous Region'),
    'lga': ('lga_code', None, 'Local Government Area'),
    'poa': ('poa_code', None, 'Postal Areas'),
    'ra': ('ra_code16', None, 'Remoteness Area'),
    'sa1': ('sa1_7digit', sqlalchemy.types.Integer, 'Statistical Area Level 1'),
    'sa2': ('sa2_main', None, 'Statistical Area Level 2'),
    'sa3': ('sa3_code', None, 'Statistical Area Level 3'),
    'sa4': ('sa4_code', None, 'Statistical Area Level 4'),
    'sed': ('sed_code', None, 'State Electoral Division'),
    'sos': ('sos_code16', None, 'Section of State'),
    'sosr': ('sosrcode16', None, 'Section of State Range'),
    'ssc': ('ssc_code', None, 'State Suburb'),
    'ste': ('state_code', None, 'State/Territory'),
    'sua': ('sua_code16', None, 'Significant Urban Areas'),
    'ucl': ('ucl_code16', None, 'Urban Centre/Locality')
}


def load_shapes(factory, census_dir, tmpdir):
    with factory.make_loader(SHAPE_SCHEMA, mandatory_srids=[3112, 3857]) as loader:

        def load_shapes():
            logger.info("load census shapefiles")
            for table_name, fname in SHAPE_ZIPS:
                with ZipAccess(None, tmpdir, os.path.join(census_dir + '/Digital Boundaries/', fname)) as z:
                    for shpfile in z.glob("*.shp"):
                        instance = ShapeLoader(loader.dbschema(), shpfile, 4283, table_name=table_name)
                        instance.load(loader)
            logger.info("loaded shapefiles OK")
            logger.info("creating shape indexes")
            # create column indexes on shape linkage
            loader.session.commit()
            for census_division in SHAPE_LINKAGE:
                logger.info('creating index for %s' % (census_division))
                table = loader.get_table(census_division)
                col, _, descr = SHAPE_LINKAGE[census_division]
                loader.set_table_metadata(census_division, {'description': descr})
                idx = sqlalchemy.Index("%s_%s_idx" % (census_division, col), table.columns[col], unique=True)
                idx.create(loader.engine)

        loader.set_metadata(
            name='ABS Census 2016',
            description="2016 Australian Census: Spatial Data",
            date_published=datetime(2016, 6, 27, 3, 0, 0)  # Set in UTC
        )
        loader.session.commit()
        load_shapes()
        return loader.result()
