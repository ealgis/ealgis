from django.apps import AppConfig
from ealgis.ealgis import EAlGIS

class EalauthConfig(AppConfig):
    name = 'ealgis.ealauth'
    
    def ready(self):
        self.eal = EAlGIS()
        schema_names = self.eal.get_schemas()
        print("Found {} EAlGIS-compliant schemas: {}".format(len(schema_names), ",".join(schema_names)))