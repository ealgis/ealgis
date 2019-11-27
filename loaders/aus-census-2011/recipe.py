from census2011 import load_shapes
from census2011 import load_attrs
from ealgis.common.db import DataLoaderFactory
from ealgis.common.util import make_logger


logger = make_logger(__name__)


def main():
    tmpdir = "/tmp"
    census_dir = '/data/2011 Datapacks BCP_IP_TSP_PEP_ECP_WPP_ERP_Release 3'
    factory = DataLoaderFactory(db_name="scratch_census_2011", clean=False)
    shape_result = load_shapes(factory, census_dir, tmpdir)
    attrs_results = load_attrs(factory, census_dir, tmpdir)
    for result in [shape_result] + attrs_results:
        result.dump("/app/dump/")


if __name__ == '__main__':
    main()
