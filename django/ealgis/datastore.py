
#
# control access to the EAlGIS datastore from the webapp
#

from ealgis_common.db import Database
from .util import make_logger


logger = make_logger(__name__)


class DatabaseWrapper:
    def __init__(self):
        self._database = None

    def __call__(self):
        if self._database is None:
            logger.info('initialising access to the datastore')
            self._database = Database()

        return self._database


datastore = DatabaseWrapper()
