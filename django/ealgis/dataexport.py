import csv
from decimal import Decimal
from io import StringIO


def export_iter(defn_obj, bounds=None, include_geom_attrs=False):
    # figure out our queries to run, grouped by source geometry
    defn = defn_obj.get()
    layers = defn.get('layers')
    expressions = {}
    for layer in layers:
        if layer["visible"]:
            expr = defn_obj.compile_expr(layer, include_geometry=False, order_by_gid=True, include_geom_attrs=include_geom_attrs)
            if expr.is_trivial():
                continue
            geom_source_table_info = expr.get_geometry_source_table_info()
            if geom_source_table_info not in expressions:
                expressions[geom_source_table_info] = []
            expressions[geom_source_table_info].append(expr)

    def next_or_none(it):
        try:
            return next(it)
        except StopIteration:
            return None, None

    if bounds is None:
        def mkq(q):
            return q.get_query()
    else:
        def mkq(q):
            return q.get_query_bounds(*bounds, srid=4326)

    # for each geometry, yield a header and then the data for each geom in the geometry
    for geom_source_table_info in expressions:
        queries = expressions[geom_source_table_info]
        # q.query_attrs[2:] because the first three columns in query_attrs are gid, q
        yield [geom_source_table_info.name + ".gid"] + [q.get_name() for q in queries] + [[str(a) for a in q.query_attrs[2:]] for q in queries][0]
        iters = [iter(mkq(q).yield_per(1)) for q in queries]
        vals = [next_or_none(i) for i in iters]
        while True:
            # figure the minimum gid in these results
            min_gid = min([t[0] for t in vals])
            row = [min_gid]
            new_vals = []
            # grab the vals for that GID out; and jump forward
            # on corresponding iterators
            for obj, iterator in zip(vals, iters):
                if obj[0] is None:
                    continue
                gid, *vals = list(obj)

                if gid == min_gid:
                    for val in vals:
                        if isinstance(val, Decimal):
                            val = float(val)
                        row.append(val)

                    new_vals.append(next_or_none(iterator))
                else:
                    row.append(None)
                    new_vals.append((gid, val))
            vals = new_vals
            if len([t for t in row if t is not None]) == 0:
                break
            yield row


def export_csv_iter(*args, **kwargs):
    s = StringIO()
    w = csv.writer(s)
    for row in export_iter(*args, **kwargs):
        w.writerow(row)
        s.flush()
        yield s.getvalue()
        s.truncate(0)
