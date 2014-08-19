try:
    import simplejson as json
except ImportError:
    import json
import urllib
from flask import request, jsonify, abort, Response
from flask.ext.login import current_user, login_required
from db import EAlGIS, MapDefinition, Setting, NoMatches, TooManyMatches, CompilationError
from colour_scale import colour_for_layer, definitions
app = EAlGIS().app

# handler broken out due to complexity of surrounding code
from mapserver import mapserver_wms  # noqa


def is_administrator(map_defn):
    email = current_user.get_email()
    administrators = map_defn.get().get('administrators')
    # for now it's more sane to not lock anyone out if there are no admins
    # eg. treat as public
    if administrators is None:
        return True
    administrators = administrators.strip()
    if administrators == '':
        return True
    admin_emails = [t.lower().strip() for t in administrators.splitlines()]
    if email.lower() in admin_emails:
        return True
    else:
        return False


# @app.route("/api/0.1/maps/<map_name>", methods=['POST', 'GET', 'DELETE'])
# @login_required
# def api_map(map_name):
#     eal = EAlGIS()
#     defn = MapDefinition.get_by_name(map_name)
#     if request.method == 'POST':
#         if (defn is not None) and (not is_administrator(defn)):
#             abort(403)
#         try:
#             if 'json' not in request.form:
#                 abort(400)
#             if defn is None:
#                 defn = MapDefinition(name=map_name)
#                 eal.db.session.add(defn)
#                 eal.db.session.commit()
#             try:
#                 rev = defn.set(json.loads(request.form['json']))
#                 eal.db.session.commit()
#             except ValueError:
#                 abort(400)
#             return jsonify(status="OK", updated=defn.get(), rev=rev)
#         except CompilationError as e:
#             return jsonify(status="ERROR", title="Expression compilation failed", mesg=e.message)
#         except NoMatches as e:
#             return jsonify(status="ERROR", title="Attribute could not be resolved", mesg=e.message)
#         except TooManyMatches as e:
#             return jsonify(status="ERROR", title="Attribube reference is ambiguous", mesg=e.message)
#     elif request.method == 'DELETE':
#         if defn is None:
#             abort(404)
#         if not is_administrator(defn):
#             abort(403)
#         eal.db.session.delete(defn)
#         eal.db.session.commit()
#         return jsonify(status="OK")
#     else:
#         if defn is None:
#             abort(404)
#         return jsonify(object=defn.get(), meta={'administrator': is_administrator(defn)})


@app.route("/api/v2/auth/current_user")
def api_userinfo():
    info = {}
    if current_user.is_authenticated():
        info['id'] = current_user.id
    return jsonify(**info)


@app.route("/api/v2/map/<map_name>/legend/<layer_id>/<client_rev>", methods=['GET'])
@login_required
def layer_legend(map_name, layer_id, client_rev):
    defn_obj = MapDefinition.get_by_name(map_name)
    if defn_obj is None:
        abort(404)
    defn = defn_obj.get()
    if 'layers' not in defn:
        abort(404)
    layer_defn = defn['layers'].get(layer_id, None)
    if layer_defn is None:
        abort(404)
    scale = colour_for_layer(layer_defn)
    return Response(
        headers={'Cache-Control': 'max-age=86400, public'},
        response=scale.legend(),
        status=200,
        content_type='image/png')


@app.route("/api/v2/map/<map_name>/export-csv", methods=['GET'])
@login_required
def layer_export(map_name):
    defn_obj = MapDefinition.get_by_name(map_name)
    if defn_obj is None:
        abort(404)
    from dataexport import export_csv_iter
    return Response(
        headers={
            'Cache-Control': 'max-age=86400, public',
            'Content-Disposition': 'inline; filename="%s.csv"' % urllib.quote(map_name)
        }, response=export_csv_iter(defn_obj), status=200, content_type='text/csv')


@app.route("/api/v2/map/<map_name>/export-csv/<ne>/<sw>", methods=['GET'])
@login_required
def layer_export_bounds(map_name, ne, sw):
    defn_obj = MapDefinition.get_by_name(map_name)
    if defn_obj is None:
        abort(404)
    ne = map(float, ne.split(','))
    sw = map(float, sw.split(','))
    if len(ne) != 2 or len(sw) != 2:
        abort(404)
    from dataexport import export_csv_iter
    return Response(headers={
        'Cache-Control': 'max-age=86400, public',
        'Content-Disposition': 'inline; filename="%s_%f_%f_%f_%f.csv"' % (urllib.quote(map_name), ne[0], ne[1], sw[0], sw[1])
    }, response=export_csv_iter(defn_obj, (ne, sw)), status=200, content_type='text/csv')
