from django.apps import AppConfig
from ealgis.ealgis import EAlGIS

class EalauthConfig(AppConfig):
    name = 'ealgis.ealauth'
    
    def ready(self):
        eal = EAlGIS()
        schema_names = eal.get_schemas()
        print("Found {} EAlGIS-compliant schemas: {}".format(len(schema_names), ",".join(schema_names)))