from django.apps import AppConfig
from ..util import make_logger, get_env
from ..datastore import datastore

logger = make_logger(__name__)


class EalauthConfig(AppConfig):
    name = 'ealgis.ealauth'

    def ready(self):
        import ealgis.ealauth.signals  # noqa

        self.private_site = get_env('EALGIS_PRIVATE_SITE')
        self.map_srid = 3857
        self.projected_srid = 3112

        # An Ealgis instance needs admins
        from .admin import get_ealgis_admins
        if len(get_ealgis_admins()) == 0:
            logger.warning("This Ealgis instance doesn't have any admin users.")

        # Discover Ealgis-compliant data schemas
        schema_names = datastore().get_ealgis_schemas()
        logger.info("Found {} EAlGIS-compliant schemas: {}".format(len(schema_names), ",".join(schema_names)))
