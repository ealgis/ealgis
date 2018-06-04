from django.apps import AppConfig
from ealgis.util import make_logger, get_env
from ealgis_common.db import broker
from raven import Client

logger = make_logger(__name__)


class EalauthConfig(AppConfig):
    name = 'ealgis.ealauth'

    def ready(self):
        import ealgis.ealauth.signals  # noqa

        self.private_site = get_env('EALGIS_CONFIG_PRIVATE_SITE')
        self.map_srid = 3857
        self.projected_srid = 3112

        # Raven
        raven_config = {"dsn": get_env("RAVEN_URL"), "environment": get_env("ENVIRONMENT"), "site": get_env("EALGIS_SITE_NAME")}
        # Disable logging errors dev
        from ealgis.ealauth.admin import is_development
        if is_development():
            raven_config["dsn"] = None
        self.raven = Client(**raven_config)

        # An Ealgis instance needs admins
        from ealgis.ealauth.admin import get_ealgis_admins
        if len(get_ealgis_admins()) == 0:
            logger.error("This Ealgis instance doesn't have any admin users.")

        # Discover Ealgis-compliant data schemas
        info = broker.schema_information()
        schema_names = info.get_ealgis_schemas()
        logger.info("Found {} EAlGIS-compliant schemas: {}".format(len(schema_names), ",".join(schema_names)))
