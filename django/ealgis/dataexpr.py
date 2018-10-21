#
# based upon arith.py from the pyparsing documentation
#

import sqlalchemy
from pyparsing import Word, nums, alphanums, Combine, oneOf, Optional, \
    opAssoc, operatorPrecedence
from sqlalchemy.dialects import postgresql
from django.apps import apps
from .util import make_logger
from .datastore import datastore

logger = make_logger(__name__)


def operatorOperands(tokenlist):
    "generator to extract operators and operands in pairs"
    it = iter(tokenlist)
    while True:
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
                    expr_state.add_implicit_filter(evaled != 0)
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


class DataExpressionParser:
    """
    holding class for the pyParsing terms defining arithmetic
    and conditional expression that we can parse
    """

    integer = Word(nums)
    real = (Combine(Word(nums) + Optional("." + Word(nums)) +
                    oneOf("E e") + Optional(oneOf('+ -')) + Word(nums)) |
            Combine(Word(nums) + "." + Word(nums)))

    variable = Word(alphanums + '._')
    operand = real | integer | variable

    signop = oneOf('+ -')
    multop = oneOf('* / // %')
    plusop = oneOf('+ -')
    comparisonop = oneOf("< <= > >= == !=")
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

    def __init__(self, geometry_source, geometry_class):
        self.geometry_source = geometry_source
        self.geometry_class = geometry_class
        # joins to be resolved
        self.joins = set()
        # implict filters (to avoid divide-by-zero)
        self.implicit_filters = []

    def lookup(self, attribute):
        # upper case schemas or columns seem unlikely, but a possible FIXME
        attribute = attribute.lower()
        schema_name, attribute_name = attribute.split('.', 1)

        with datastore().access_schema(schema_name) as db:
            attr_column_info, attr_column_linkage = db.get_attribute_info(self.geometry_source, attribute_name)
            # attr_tbl: aus_census_2011_xcp.x06s3_aust_lga
            attr_tbl = db.get_table_class_by_id(attr_column_info.table_info_id)

        # attr_column_info.name: x4630
        # attr_attr: aus_census_2011_xcp.x06s3_aust_lga_1.x4630
        attr_attr = getattr(attr_tbl, attr_column_info.name)

        # and our join columns
        # attr_column_linkage.attr_column: gid
        # attr_linkage: aus_census_2011_xcp.x06s3_aust_lga.gid
        attr_linkage = getattr(attr_tbl, attr_column_linkage.attr_column)

        # self.geometry_class: aus_census_2011_shapes.lga
        # attr_column_linkage.attr_column: gid
        # tbl_linkage: aus_census_2011_shapes.lga_1.gid
        tbl_linkage = getattr(self.geometry_class, attr_column_linkage.attr_column)

        self.joins.add((attr_tbl, attr_linkage, tbl_linkage))

        return attr_attr

    def add_implicit_filter(self, f):
        self.implicit_filters.append(f)


class DataExpressionParserTest(DataExpressionParser):
    """
    stub class so we can test without a database
    """

    def __init__(self, symbol_table=None):
        self.symbol_table = symbol_table or {}
        super().__init__(None, None)

    def lookup(self, attribute):
        return self.symbol_table[attribute]


class DataExpression:
    """
    parse user-provided query expressions (with conditions) and product SQL
    queries which evaluate them, including all relevant joins
    """

    def __init__(self, name, geometry_source, expression, conditional,
                 srid=None, include_geometry=True, order_by_gid=False):
        self.name = name
        self.geometry_source = geometry_source
        self.query = self.build_query(expression, conditional, srid, include_geometry, order_by_gid)

    def build_query(self, expression, conditional, srid, include_geometry, order_by_gid):
        def get_geometry_column():
            column = None
            if srid is not None:
                column = db.get_geometry_source_column(self.geometry_source, srid).geometry_column
            if column is None:
                column = self.geometry_source.column
            return column

        def get_initial_query_attributes():
            query_attrs = []
            if include_geometry:
                query_attrs.append(
                    getattr(self.geometry_class, self.geometry_column))
            query_attrs.append(self.gid_attr)
            return query_attrs

        def parse_expression():
            if self.trivial:
                # put a harmless function in, so that we are still running a query
                return sqlalchemy.func.abs(0)
            else:
                parsed = DataExpressionParser.arith_expr.parseString(expression, parseAll=True)[0]
                # + 0 is to stop non-binary expressions breaking with sqlalchemy's label() -- bodge, fixme
                return parsed.eval(self.parser) + 0

        def parse_condition():
            if conditional == '':
                return None
            cond_processed = conditional.replace("$value", "(%s)" % expression)
            parsed = DataExpressionParser.cond_expr.parseString(cond_processed, parseAll=True)[0]
            return parsed.eval(self.parser)

        with datastore().access_schema(self.geometry_source.__table__.schema) as db:
            self.geometry_column = get_geometry_column()
            self.geometry_source_table_info = db.get_table_info_by_id(self.geometry_source.table_info_id)
            self.geometry_class = db.get_table_class_by_id(self.geometry_source.table_info_id)
            self.gid_attr = getattr(self.geometry_class, self.geometry_source.gid_column)
            self.trivial = expression == ''
            self.parser = DataExpressionParser(self.geometry_source, self.geometry_class)

            query_attrs = get_initial_query_attributes()

            # parse the core expression and build up our query
            parsed_expression = parse_expression()
            query_attrs.append(sqlalchemy.sql.expression.label('q', parsed_expression))

            # Attach all columns from the geometry source
            for column in db.get_geometry_source_attribute_columns(self.geometry_source_table_info.name):
                query_attrs.append(getattr(self.geometry_class, column.name))

            self.query_attrs = query_attrs
            query = db.session.query(*query_attrs)

            # apply condition expression (if any), plus any implicit != 0 conditions
            filter_expression = parse_condition()
            if filter_expression is not None:
                query = query.filter(filter_expression)
            for implicit_condition in self.parser.implicit_filters:
                query = query.filter(implicit_condition)

            # add all requeired joins into the query (joining between geometry and attribute tables)
            for tbl, join_l, join_r in self.parser.joins:
                query = query.join(tbl, join_l == join_r)

            if order_by_gid:
                query = query.order_by(self.gid_attr)
            return query

    def __repr__(self):
        return "DataExpression<%s>" % self.name

    @property
    def is_trivial(self):
        """
        a query is trivial if we don't actually return any attributes
        e.g. geometry only layers
        """
        return self.trivial

    def get_name(self):
        return self.name

    def get_query(self):
        return self.query

    def get_query_bounds(self, ne, sw, srid):
        ymin, xmin = sw
        ymax, xmax = ne
        proj_srid = int(apps.get_app_config('ealauth').projected_srid)

        with datastore().access_schema(self.geometry_source.__table__.schema) as db:
            proj_column = db.get_geometry_source_column(self.geometry_source, proj_srid).geometry_column

        q = self.query.filter(sqlalchemy.func.st_intersects(
            sqlalchemy.func.st_transform(
                sqlalchemy.func.st_makeenvelope(xmin, ymin, xmax, ymax, srid),
                proj_srid),
            getattr(self.geometry_class, proj_column)))
        return q

    def get_geometry_source(self):
        return self.geometry_source

    def get_geometry_source_table_info(self):
        return self.geometry_source_table_info

    def get_printed_query(self):
        return self.query.statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True})

    def get_postgis_query(self):
        return ("%s" % (self.get_printed_query())).replace("\n", "")
