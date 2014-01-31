#!/usr/bin/env python

import sys
import csv
from decimal import Decimal
from StringIO import StringIO
from db import MapDefinition


def export_iter(defn_obj, bounds=None):
    # figure out our queries to run, grouped by source geometry
    defn = defn_obj.get()
    layers = defn.get('layers')
    expressions = {}
    for layer in sorted(layers, key=lambda k: int(k)):
        expr = defn_obj.compile_expr(layers[layer], include_geometry=False, order_by_gid=True)
        if expr.is_trivial():
            continue
        geom_source = expr.get_geometry_source()
        if geom_source not in expressions:
            expressions[geom_source] = []
        expressions[geom_source].append(expr)

    def next_or_none(it):
        try:
            return next(it)
        except StopIteration:
            return None, None

    if bounds is None:
        mkq = lambda q: q.get_query()
    else:
        mkq = lambda q: q.get_query_bounds(*bounds, srid=4326)

    # for each geometry, yield a header and then the data for each geom in the geometry
    for geom_source in expressions:
        queries = expressions[geom_source]
        yield [geom_source.table_info.name] + [q.get_name() for q in queries]
        iters = [iter(mkq(q).yield_per(1)) for q in queries]
        vals = [next_or_none(i) for i in iters]
        while True:
            # figure the minimum gid in these results
            min_gid = min([t[0] for t in vals])
            row = [min_gid]
            new_vals = []
            # grab the vals for that GID out; and jump forward
            # on corresponding iterators
            for (gid, val), iterator in zip(vals, iters):
                if gid == min_gid:
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

if __name__ == '__main__':
    map_name = sys.argv[1]
    defn_obj = MapDefinition.get_by_name(map_name)
    if defn_obj is None:
        sys.exit(1)
    w = csv.writer(sys.stdout)
    for row in export_iter(
            defn_obj, [(-31.91534106639876, 115.91443324565473), (-31.921000867731685, 115.90771699428872)]):
        w.writerow(row)
