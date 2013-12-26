
from hashlib import sha1
import os.path, pickle, urllib

cache_path = './cache/'
def cache_result(fn):
    def _wrapped(*args, **kwargs):
        arg_hash = sha1()
        arg_hash.update(pickle.dumps(args))
        arg_hash.update(pickle.dumps(kwargs))
        cache_file = os.path.join(cache_path, urllib.quote(fn.__name__) + '.' + arg_hash.hexdigest())
        try:
            with open(cache_file, 'rb') as fd:
                c_args, c_kwargs, rv = pickle.load(fd)
                assert(c_args == args)
                assert(c_kwargs == kwargs)
                return rv
        except IOError:
            rv = fn(*args, **kwargs)
            with open(cache_file, 'wb') as fd:
                pickle.dump((args, kwargs, rv), fd)
            return rv
    return _wrapped

