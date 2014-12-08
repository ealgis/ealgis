
from flask import request, abort, Response
from flask.ext.login import login_required
import os
import mapscript
from db import EAlGIS, MapDefinition
from colour_scale import colour_for_layer


# mapserver utility functions
def iget_iter(fn):
    i = 0
    while True:
        try:
            obj = fn(i)
        except mapscript._mapscript.MapServerChildError:
            obj = None
        if obj is None:
            break
        yield obj
        i = i + 1


layer_iter = lambda m: iget_iter(m.getLayer)
class_iter = lambda c: iget_iter(c.getClass)
style_iter = lambda s: iget_iter(s.getStyle)


class Layer(object):
    @classmethod
    def rgba_to_colorobj(cls, rgba, obj):
        obj.setRGB(rgba['r'], rgba['g'], rgba['b'])
        obj.alpha = int(rgba['a'] * 255)

    def __init__(self, instance, name, defn):
        def build_layer(geo_query):
            layer = mapscript.layerObj()
            layer.type = mapscript.MS_LAYER_POLYGON
            layer.status = mapscript.MS_DEFAULT
            layer.name = self.name = name
            layer.connectiontype = mapscript.MS_POSTGIS
            layer.connection = "dbname=" + EAlGIS().dbname()
            layer.data = geo_query
            # layer.label = "[sa1_7digit]"
            layer.processing = "CLOSE_CONNECTION=DEFER"
            layer.labelitem = None
            return layer

        # we need to build the query knowing what data we need
        # to build the map;
        #   - what is our geometry table & column
        #   - which attribute data do we need, and how should it be
        #     named?
        self.defn = defn
        geolinkage_ids = set()
        fill_geolinkage_id = 617
        geolinkage_ids.add(fill_geolinkage_id)

        self.layer = build_layer(self.defn['fill']['_mapserver_query'])
        fill = self.defn['fill']
        instance.insertLayer(self.layer)
        do_fill = (fill['expression'] != '')
        if do_fill:
            scale_min = float(fill['scale_min'])
            scale_max = float(fill['scale_max'])
            opacity = float(fill['opacity'])
            self.make_colour_scale('q', float(scale_min), float(scale_max), opacity)
        else:
            cls = self.make_class()
            self.outline(cls)

    def make_class(self):
        cls = mapscript.classObj()
        cls.name = "testing"
        self.layer.insertClass(cls)
        return cls

    def make_style(self, cls):
        style = mapscript.styleObj()
        cls.insertStyle(style)
        return style

    def fill(self, cls):
        style = self.make_style(cls)
        if self.defn['background']['fill']['colour'] is not None:
            Layer.rgba_to_colorobj(self.defn['background']['fill']['colour'], style.color)

    def outline(self, cls):
        width = self.defn['line']['width']
        if width <= 0:
            return
        style = self.make_style(cls)
        style.width = self.defn['line']['width']
        if self.defn['line']['colour'] is not None:
            Layer.rgba_to_colorobj(self.defn['line']['colour'], style.outlinecolor)

    def make_colour_scale(self, attr, cmin, cmax, opacity):
        scale = colour_for_layer(self.defn)

        def add_class(rgb, expr):
            rgb *= 255.
            cls = self.make_class()
            cls.setExpression(expr)
            self.outline(cls)
            style = self.make_style(cls)
            style.color.setRGB(int(rgb.r), int(rgb.g), int(rgb.b))
            style.color.alpha = int(opacity * 255)

        # below cmin
        inc = float(cmax - cmin) / (scale.nlevels - 2)
        add_class(scale.lookup(cmin - inc), "([%s] < %g)" % (attr, cmin))
        # intermediate "within range" levels
        for idx in xrange(1, scale.nlevels - 1):
            vfrom = cmin + (idx - 1) * inc
            vto = vfrom + inc
            # we hedge on any floating-point rounding issues with a have increment jump into our level
            # for the colour lookup
            add_class(scale.lookup(vfrom + inc / 2.), "([%s] >= %g AND [%s] < %g)" % (attr, vfrom, attr, vto))
        # above cmin
        add_class(scale.lookup(cmax + inc), "([%s] >= %g)" % (attr, cmax))

mapscript.msIO_installStdoutToBuffer()


class Map(object):
    def __init__(self, rev, defn):
        self.instance = mapscript.mapObj(os.path.expanduser('/vagrant/template.map'))
        self.instance.imagetype = 'png'
        self.instance.setProjection('init=epsg:%s' % (EAlGIS().get_setting('map_srid')))
        self.rev = rev
        self.layers = []
        self.layers.append(self.make_base_layer(defn))

    def make_base_layer(self, layer_defn):
        layer = Layer(self.instance, "base", layer_defn)
        return layer


class MapInstances(object):
    def __init__(self):
        self.instances = {}

    def get_or_create(self, map_name, layer_id):
        defn_obj = MapDefinition.get_by_name(map_name)
        if defn_obj is None:
            return None
        defn = defn_obj.get()
        rev = defn.get('rev', 0)
        if 'layers' not in defn:
            return None
        layer_defn = defn['layers'].get(layer_id, None)
        if layer_defn is None:
            return None
        key = (defn_obj.id, layer_id)
        wrapper = self.instances.get(key, None)
        if wrapper is not None and wrapper.rev != rev:
            wrapper = None
            del self.instances[key]
        if wrapper is None:
            wrapper = Map(rev, layer_defn)
            self.instances[key] = wrapper
        return wrapper

instances = MapInstances()

app = EAlGIS().app


@app.route("/api/0.1/map/<map_name>/mapserver_wms/<layer_id>/<client_rev>", methods=['GET'])
@login_required
def mapserver_wms(map_name, layer_id, client_rev):
    wrapper = instances.get_or_create(map_name, layer_id)
    if wrapper is None:
        abort(404)
    # load in request parameters
    req = mapscript.OWSRequest()
    for (k, v) in request.args.iteritems():
        if k == 'LAYERS':
            v = ','.join((t.name for t in wrapper.layers))
        req.setParameter(k, v)
    # shared stdio buffer object thing; make sure that there's nothing left over
    # from an aborted request stuck in there
    mapscript.msIO_getStdoutBufferBytes()
    try:
        wrapper.instance.OWSDispatch(req)
        headers = {'Cache-Control': 'max-age=86400, public'}
    except mapscript.MapServerError:
        # don't cache errors
        headers = {}
    content_type = mapscript.msIO_stripStdoutBufferContentType()
    content = mapscript.msIO_getStdoutBufferBytes()
    return Response(headers=headers, response=content, status=200, content_type=content_type)
