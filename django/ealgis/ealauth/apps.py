from django.apps import AppConfig
from ealgis.ealgis import EAlGIS

from ealgis.util import make_logger


logger = make_logger(__name__)


class EalauthConfig(AppConfig):
    name = 'ealgis.ealauth'

    def ready(self):
        self.eal = EAlGIS()
        self.map_srid = 3857
        self.projected_srid = 3112

        schema_names = self.eal.get_schemas()
        logger.info("Found {} EAlGIS-compliant schemas: {}".format(len(schema_names), ",".join(schema_names)))
