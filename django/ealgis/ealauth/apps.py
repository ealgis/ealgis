from django.apps import AppConfig
from ealgis.util import make_logger, get_env
from ealgis_common.db import broker

logger = make_logger(__name__)


class EalauthConfig(AppConfig):
    name = 'ealgis.ealauth'

    def ready(self):
        import ealgis.ealauth.signals  # noqa

        self.private_site = get_env('EALGIS_CONFIG_PRIVATE_SITE')
        self.map_srid = 3857
        self.projected_srid = 3112

        db = broker.Provide(None)
        schema_names = db.get_ealgis_schemas()
        logger.info("Found {} EAlGIS-compliant schemas: {}".format(len(schema_names), ",".join(schema_names)))
