from ...dataexpr import DataExpressionParserTest


def test_addition():
    parsed = DataExpressionParserTest.arith_expr.parseString('1 + 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    print(parsed.eval(parser) == 3)


def test_multiplication():
    parsed = DataExpressionParserTest.arith_expr.parseString('2 * 3', parseAll=True)[0]
    parser = DataExpressionParserTest()
    print(parsed.eval(parser) == 6)


def test_modulo():
    parsed = DataExpressionParserTest.arith_expr.parseString('28 % 10', parseAll=True)[0]
    parser = DataExpressionParserTest()
    print(parsed.eval(parser) == 8)
