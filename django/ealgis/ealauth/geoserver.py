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
    
    def send_head_request(self, url):
        r = requests.head(url, 
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
        Create any layers this map has this don't already exist in GeoServer.
        """
        for layer in self.layers:
            layer.create()
    
    # Layers can be shared amongst maps - so we'll leave this stub here for 
    # later use if we want to write layer cleaning up code.
    # def remove_layers(self):
    #     """
    #     Delete layers in GeoServer for an existing map.
    #     """
    #     for layer in self.layers:
    #         layer.remove()


class GeoServerLayer(object):
    def __init__(self, map, defn):
        self.manager = GeoServerManager()
        self.map = map
        self.defn = defn
        self.layer_name = self.defn["hash"]
    
    def create(self):
        """
        Create a new GeoServer layer based on a new FeatureType with
        a custom SQL expression.
        """

        # Only create a layer if it doesn't already exist. This can happen if it exists
        # in another map, or if its map has been updated but this layer didn't change
        if self.exists() == False:
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
    
    # Layers can be shared amongst maps - so we'll leave this stub here for 
    # later use if we want to write layer cleaning up code.
    # def remove(self):
    #     """
    #     Delete this Layer, and its associated FeaturType, from GeoServer.
    #     """

    #     delete_layer_url = "{}/rest/layers/{}".format(
    #         self.manager.geoserver_base_url_docker,
    #         self.layer_name
    #     )
    #     print("delete_layer_url: {}".format(delete_layer_url))
    #     r = self.manager.send_delete_request(delete_layer_url)

    #     if r.status_code != 200:
    #         raise GeoServerAPIError("Unable to remove layer '{}': {}".format(self.defn["name"], r.text))
    #     return True
    
    def exists(self):
        """
        Check if this layer already exists in GeoServer.
        """

        get_layer_url = "{}/rest/layers/{}".format(
            self.manager.geoserver_base_url_docker,
            self.layer_name
        )
        r = self.manager.send_head_request(get_layer_url)

        return r.status_code == 200