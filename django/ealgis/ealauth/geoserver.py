import os
import requests
from requests.auth import HTTPBasicAuth

class GeoServerAPIError(Exception):
    pass

class GeoServerManager(object):
    def __init__(self):
        self.geoserver_base_url = "https://localhost:8443/geoserver"
        self.geoserver_base_url_docker = "http://geoserver:8080/geoserver"
        self.workspace_name = "EALGIS"
        self.store_name = "postgis"
        self.geoserver_editor_username = "admin"
        self.geoserver_editor_password = "geoserver"
        self.auth = HTTPBasicAuth(self.geoserver_editor_username, self.geoserver_editor_password)
    
    def send_post_request(self, url, body_xml):
        # Supply global GeoServer variables to the template
        body_xml = body_xml.replace("${GEOSERVER_BASE_URL}", self.geoserver_base_url)
        body_xml = body_xml.replace("${STORE_NAME}", self.store_name)

        r = requests.post(url, 
            data = body_xml,
            headers = {
                "Content-type": "application/xml"
            },
            auth = self.auth
        )

        return r
        # if r.status_code != 201:
        #     raise GeoServerAPIError(r.status_code)
        # return True
    
    def send_delete_request(self, url):
        r = requests.delete(url, 
            auth = self.auth
        )

        return r

class GeoServerMap(object):
    def __init__(self, name, owner_user_id, rev, defn):
        self.manager = GeoServerManager()
        self.name = name
        self.owner_user_id = owner_user_id
        self.rev = rev
        self.defn = defn
        self.layers = []

        for layer_id in defn["layers"]:
            self.layers.append(GeoServerLayer(self, defn["layers"][layer_id]))
    
    def create_layers(self):
        """
        Create layers in GeoServer for a brand new map.
        """
        if self.rev == 1:
            for layer in self.layers:
                layer.create()
    
    def recreate_layers(self):
        """
        Rereate layers in GeoServer for an existing map.
        """
        if self.rev >= 1:
            for layer in self.layers:
                layer.remove()
                layer.create()
    
    def remove_layers(self):
        """
        Delete layers in GeoServer for an existing map.
        """
        if self.rev >= 1:
            for layer in self.layers:
                layer.remove()


class GeoServerLayer(object):
    def __init__(self, map, defn):
        self.manager = GeoServerManager()
        self.map = map
        self.defn = defn
        # Owner User Id + Map Name + Layer Name + Map Revision defines a unique layer name
        self.layer_name = "{}_{}_{}".format(
            self.map.owner_user_id.id,
            self.map.name,
            self.defn["name"],
            self.map.rev
        )
    
    def create(self):
        """
        Create a new GeoServer layer based on a new FeatureType with
        a custom SQL expression.
        """

        # Populate the XML template describing the new layer
        with open("{}/ealgis/ealauth/templates/geoserver-layer.xml".format(os.getcwd()), "r") as f:
            layer_xml_defn = f.read()
        
        layer_xml_defn = layer_xml_defn.replace("${LAYER_NAME}", self.layer_name)
        layer_xml_defn = layer_xml_defn.replace("${SQL}", self.defn["fill"]["_geoserver_query"])

        # Issue a Create Layer API call to GeoServer
        create_layer_url = "{}/rest/workspaces/{}/datastores/{}/featuretypes".format(
            self.manager.geoserver_base_url_docker,
            self.manager.workspace_name,
            self.manager.store_name
        )
        r = self.manager.send_post_request(create_layer_url, layer_xml_defn)

        if r.status_code != 201:
            raise GeoServerAPIError("Unable to create layer '{}': {}".format(self.defn["name"], r.text))
        return True
    
    def remove(self):
        """
        Delete this Layer, and its associated FeaturType, from GeoServer.
        """

        delete_layer_url = "{}/rest/layers/{}".format(
            self.manager.geoserver_base_url_docker,
            self.layer_name
        )
        r = self.manager.send_delete_request(delete_layer_url)

        if r.status_code != 200:
            raise GeoServerAPIError("Unable to remove layer '{}': {}".format(self.defn["name"], r.text))
        return True