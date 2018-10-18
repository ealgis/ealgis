from ...dataexpr import DataExpressionParserTest


def test_arith_addition():
    parsed = DataExpressionParserTest.arith_expr.parseString('1 + 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) == 3)


def test_arith_multiplication():
    parsed = DataExpressionParserTest.arith_expr.parseString('2 * 3', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) == 6)


def test_arith_modulo():
    parsed = DataExpressionParserTest.arith_expr.parseString('28 % 10', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) == 8)


def test_cond_eq():
    parsed = DataExpressionParserTest.cond_expr.parseString('2 == 1', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is False)
    parsed = DataExpressionParserTest.cond_expr.parseString('2 == 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is True)


def test_cond_gtlt():
    parsed = DataExpressionParserTest.cond_expr.parseString('2 > 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is False)
    parsed = DataExpressionParserTest.cond_expr.parseString('2 < 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is False)
    parsed = DataExpressionParserTest.cond_expr.parseString('1 < 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is True)
    parsed = DataExpressionParserTest.cond_expr.parseString('1 > 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is False)


def test_cond_gele():
    parsed = DataExpressionParserTest.cond_expr.parseString('2 >= 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is True)
    parsed = DataExpressionParserTest.cond_expr.parseString('2 <= 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is True)
    parsed = DataExpressionParserTest.cond_expr.parseString('1 <= 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is True)
    parsed = DataExpressionParserTest.cond_expr.parseString('1 >= 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is False)


def test_cond_ne():
    parsed = DataExpressionParserTest.cond_expr.parseString('2 != 2', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is False)
    parsed = DataExpressionParserTest.cond_expr.parseString('2 != 1', parseAll=True)[0]
    parser = DataExpressionParserTest()
    assert(parsed.eval(parser) is True)


def test_symbols():
    parsed = DataExpressionParserTest.cond_expr.parseString('cat * dog', parseAll=True)[0]
    parser = DataExpressionParserTest({'cat': 42, 'dog': 2})
    assert(parsed.eval(parser) == 84)
