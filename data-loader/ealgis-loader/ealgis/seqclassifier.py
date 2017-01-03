import unittest


class SequenceClassifier(object):
    casts = (int, float)

    def __init__(self):
        self.possible = list(SequenceClassifier.casts)

    def update(self, v):
        def test(cast):
            try:
                cast(v)
            except ValueError:
                return False
            return True

        ok = []
        for cast in self.possible:
            if test(cast):
                ok.append(cast)
        self.possible = ok

    def get(self):
        if len(self.possible) > 0:
            return self.possible[0]
        return str


class TestSequenceClassifier(unittest.TestCase):
    def run_seq(self, s):
        c = SequenceClassifier()
        map(c.update, s)
        return c.get()

    def test_float_seq(self):
        self.assertEqual(self.run_seq(["1.", "2.0", "3.0000", "4"]), float)

    def test_int_seq(self):
        self.assertEqual(self.run_seq(["1", "2", "3"]), int)

    def test_float_nan_seq(self):
        self.assertEqual(self.run_seq(["1", "2", "3", "NaN"]), float)

    def test_garbage_seq(self):
        self.assertEqual(self.run_seq(["1", "2", "3", "mongoose"]), str)

if __name__ == '__main__':
    unittest.main()
