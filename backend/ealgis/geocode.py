
import urllib
from functioncache import cache_result


@cache_result
def geocode(address):
    uri = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + urllib.quote(address) + '&sensor=false'
    req = urllib.urlopen(uri)
    data = req.read()
    req.close()
    return data
