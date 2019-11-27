
import subprocess as sp
import logging
import itertools
import os.path
import os
import re

table_name_re = re.compile(r'^[A-Za-z0-9_]+$')


def make_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    handler = logging.StreamHandler()
    fmt = logging.Formatter("%(asctime)s [%(levelname)-7s] [%(threadName)s]  %(message)s")
    handler.setFormatter(fmt)
    logger.addHandler(handler)
    return logger


def pairwise(iterable):
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    a, b = itertools.tee(iterable)
    next(b, None)
    return zip(a, b)


def piperun(*cmds, **kwargs):
    capture = kwargs.get('capture', False)
    pipes = []
    assert(len(cmds) > 1)
    pipes.append(sp.Popen(cmds[0], stdout=sp.PIPE))
    for cmd, out in zip(cmds[1:], [sp.PIPE] * (len(cmds[1:]) - 1) + [sp.PIPE if capture else None]):
        last = pipes[-1]
        pipes.append(sp.Popen(cmd, stdin=last.stdout, stdout=out, stderr=out))
        last.stdout.close()
    stdin, stderr = pipes[-1].communicate()
    return stdin, stderr, pipes[-1].returncode


def cmdrun(cmd_args, stdout=None):
    p = sp.Popen(cmd_args, stdout=sp.PIPE, stderr=sp.PIPE)
    stdin, stderr = p.communicate()
    return stdin, stderr, p.returncode


def alistdir(path):
    return (os.path.join(path, t) for t in os.listdir(path) if not t.startswith("."))


def table_name_valid(table_name):
    return table_name_re.match(table_name) is not None
