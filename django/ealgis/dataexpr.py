#!/usr/bin/env python

#
# based upon arith.py from the pyparsing documentation
#

import sqlalchemy
import sys
from pyparsing import Word, nums, alphanums, Combine, oneOf, Optional, \
    opAssoc, operatorPrecedence
from django.apps import apps

eal = apps.get_app_config('ealauth').eal

def printquery(query):
    from sqlalchemy.dialects import postgresql
    return query.statement.compile(
        dialect=postgresql.dialect(),
        compile_kwargs={"literal_binds": True})


def operatorOperands(tokenlist):
    "generator to extract operators and operands in pairs"
    it = iter(tokenlist)
    while 1:
        try:
            o1 = next(it)
            o2 = next(it)
            yield o1, o2
        except StopIteration:
            break


class EvalConstant():
    "Class to evaluate a parsed constant or variable"
    def __init__(self, tokens):
        self.value = tokens[0]

    def eval(self, expr_state):
        try:
            return int(self.value)
        except ValueError:
            pass
        try:
            return float(self.value)
        except ValueError:
            pass
        return expr_state.lookup(self.value)


class EvalSignOp():
    "Class to evaluate expressions with a leading + or - sign"
    def __init__(self, tokens):
        self.sign, self.value = tokens[0]

    def eval(self, expr_state):
        mult = {'+': 1, '-': -1}[self.sign]
        return mult * self.value.eval(expr_state)


class EvalMultOp():
    "Class to evaluate multiplication and division expressions"
    def __init__(self, tokens):
        self.value = tokens[0]

    def eval(self, expr_state):
        prod = self.value[0].eval(expr_state)
        for op, val in operatorOperands(self.value[1:]):
            if op == '*':
                prod *= val.eval(expr_state)
            if op == '/':
                evaled = val.eval(expr_state)
                # add an implicit divide-by-zero filter
                if str(type(evaled)).find('sqlalchemy.') != -1:  # ultimate bodge, FIXME
                    expr_state.add_filter(evaled != 0)
                prod /= sqlalchemy.cast(evaled, sqlalchemy.Float)
            if op == '//':
                prod //= val.eval(expr_state)
            if op == '%':
                prod %= val.eval(expr_state)
        return prod


class EvalAddOp():
    "Class to evaluate addition and subtraction expressions"
    def __init__(self, tokens):
        self.value = tokens[0]

    def eval(self, expr_state):
        sum = self.value[0].eval(expr_state)
        for op, val in operatorOperands(self.value[1:]):
            if op == '+':
                sum += val.eval(expr_state)
            if op == '-':
                sum -= val.eval(expr_state)
        return sum


class EvalComparisonOp():
    "Class to evaluate comparison expressions"
    fn_map = {
        "<": '__lt__',
        "<=": '__le__',
        ">": '__gt__',
        ">=": '__ge__',
        "==": '__eq__',
        "!=": '__ne__'}

    def __init__(self, tokens):
        self.value = tokens[0]

    def eval(self, expr_state):
        val1 = self.value[0].eval(expr_state)
        for op, val in operatorOperands(self.value[1:]):
            fn = getattr(val1, EvalComparisonOp.fn_map[op])
            val2 = val.eval(expr_state)
            val1 = fn(val2)
        return val1


class EvalLogicalOp():
    "Class to evaluate comparison expressions"
    fn_map = {
        "||": '__or__',
        "&&": '__and__'}

    def __init__(self, tokens):
        self.value = tokens[0]

    def eval(self, expr_state):
        val1 = self.value[0].eval(expr_state)
        for op, val in operatorOperands(self.value[1:]):
            fn = getattr(val1, EvalLogicalOp.fn_map[op])
            val2 = val.eval(expr_state)
            val1 = fn(val2)
        return val1


class DataExpression(object):
    integer = Word(nums)
    real = (Combine(Word(nums) + Optional("." + Word(nums))
            + oneOf("E e") + Optional(oneOf('+ -')) + Word(nums))
            | Combine(Word(nums) + "." + Word(nums)))

    variable = Word(alphanums + '._')
    operand = real | integer | variable

    signop = oneOf('+ -')
    multop = oneOf('* / // %')
    plusop = oneOf('+ -')
    comparisonop = oneOf("< <= > >= == != <>")
    logicalop = oneOf("|| &&")
    operand.setParseAction(EvalConstant)
    arith_expr = operatorPrecedence(
        operand,
        [(signop, 1, opAssoc.RIGHT, EvalSignOp),
         (multop, 2, opAssoc.LEFT, EvalMultOp),
         (plusop, 2, opAssoc.LEFT, EvalAddOp),
         ])
    cond_expr = operatorPrecedence(
        operand,
        [(signop, 1, opAssoc.RIGHT, EvalSignOp),
         (multop, 2, opAssoc.LEFT, EvalMultOp),
         (plusop, 2, opAssoc.LEFT, EvalAddOp),
         (comparisonop, 2, opAssoc.LEFT, EvalComparisonOp),
         (logicalop, 2, opAssoc.LEFT, EvalLogicalOp),
         ])

    def __init__(self, name, geometry_source, expr, cond, srid=None, include_geometry=True, order_by_gid=False):
        self.name = name
        self.geometry_source = geometry_source
        self.geometry_column = None
        self.srid = srid

        # attempt to get a column in the desired SRID, this speeds things up
        if self.srid is not None:
            from ealgis.models import GeometrySource
            self.geometry_column = GeometrySource.srid_column(self.geometry_source, self.srid)
        if self.geometry_column is None:
            self.geometry_column = self.geometry_source.column
            self.srid = self.geometry_source.srid
        self.table_instances = {}
        self.filters = []

        self.joins = set()
        self.tbl = self.get_table_class(geometry_source.table_info.name, geometry_source.__table__.schema)

        query_attrs = []
        if include_geometry:
            query_attrs.append(
                getattr(self.tbl, self.geometry_column))
        gid_attr = getattr(self.tbl, geometry_source.gid)
        query_attrs.append(gid_attr)
        # special case for empty expression
        if expr == '':
            # bodge bodge bodge, keep 'q' working
            expr = sqlalchemy.func.abs(0)
            self.trivial = True
        else:
            parsed = DataExpression.arith_expr.parseString(expr, parseAll=True)[0]
            self.trivial = False
            # + 0 is to stop non-binary expressions breaking with sqlalchemy's label() -- bodge, fixme
            expr = parsed.eval(self) + 0
        query_attrs.append(sqlalchemy.sql.expression.label('q', expr))
        filter_expr = None
        if cond != '':
            parsed = DataExpression.cond_expr.parseString(cond, parseAll=True)[0]
            filter_expr = parsed.eval(self)
        self.query = eal.session.query(*query_attrs)
        if filter_expr is not None:
            self.query = self.query.filter(filter_expr)
        for filter_expr in self.filters:
            self.query = self.query.filter(filter_expr)
        for tbl, join_l, join_r in self.joins:
            self.query = self.query.join(tbl, join_l == join_r)
        if order_by_gid:
            self.query = self.query.order_by(gid_attr)

    def __repr__(self):
        return "DataExpression<%s>" % self.name

    def is_trivial(self):
        return self.trivial

    def get_name(self):
        return self.name

    def get_table_class(self, table_name, schema_name):
        key = "{}.{}".format(table_name, schema_name)
        if key not in self.table_instances:
            self.table_instances[key] = eal.get_table_class(table_name, schema_name)
        return self.table_instances[key]

    def lookup(self, attr_name):
        attr_column_linkage, attr_column_info = eal.resolve_attribute(self.geometry_source, attr_name)
        attr_tbl = self.get_table_class(attr_column_info.table_info.name, attr_column_info.__table__.schema)
        attr_attr = getattr(attr_tbl, attr_column_info.name)
        # and our join columns
        attr_linkage = getattr(attr_tbl, attr_column_linkage.attr_column)
        tbl_linkage = getattr(self.tbl, attr_column_linkage.geo_column)
        self.joins.add((attr_tbl, attr_linkage, tbl_linkage))
        return attr_attr

    def add_filter(self, f):
        self.filters.append(f)

    def get_query(self):
        return self.query

    def get_query_bounds(self, ne, sw, srid):
        ymin, xmin = sw
        ymax, xmax = ne
        proj_srid = int(eal.get_setting('projected_srid'))
        proj_column = self.geometry_source.srid_column(proj_srid)
        q = self.query.filter(sqlalchemy.func.st_intersects(
            sqlalchemy.func.st_transform(
                sqlalchemy.func.st_makeenvelope(xmin, ymin, xmax, ymax, srid),
                proj_srid),
            getattr(self.tbl, proj_column)))
        return q

    def get_geometry_source(self):
        return self.geometry_source

    def get_printed_query(self):
        return printquery(self.query)

    def get_postgis_query(self):
        return ("%s" % (self.get_printed_query())).replace("\n", "")


if __name__ == '__main__':
    src = eal.get_table_info('sa1_2011_aust').geometry_source
    expr = DataExpression('CommandLine', src, sys.argv[1], sys.argv[2])
    print("Raw query::\n")
    print(''.join(["   " + t + '\n' for t in expr.get_printed_query().splitlines()]))
    print("\PostGIS query\n")
    print('    ' + expr.get_postgis_query())
    print("Test:", len(expr.get_query()[:10]))
