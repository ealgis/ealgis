from django.apps import AppConfig
from ealgis.ealgis import EAlGIS

class EalauthConfig(AppConfig):
    name = 'ealgis.ealauth'
    
    def ready(self):
        eal = EAlGIS()
        schemas = eal.scan_schemas()
        print("Found {} EAlGIS-compliant schemas: {}".format(len(schemas), ",".join(schemas)))