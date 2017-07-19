from django.apps import AppConfig
from ealgis.ealgis import EAlGIS
from ealgis.util import make_logger, get_env

logger = make_logger(__name__)


class EalauthConfig(AppConfig):
    name = 'ealgis.ealauth'

    def ready(self):
        import ealgis.ealauth.signals  # noqa

        self.eal = EAlGIS()
        self.private_site = get_env('EALGIS_CONFIG_PRIVATE_SITE')
        self.map_srid = 3857
        self.projected_srid = 3112

        schema_names = self.eal.get_schema_names()
        logger.info(
            "Found {} EAlGIS-compliant schemas: {}".format(len(schema_names), ",".join(schema_names)))
