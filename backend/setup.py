
import os
from setuptools import setup

setup(name='ealgis',
      version='0.0.1',
      description='EAlGIS',
      long_description='Interactive geospatial mapping system',
      author='Grahame Bowland',
      author_email='grahame@angrygoats.net',
      packages=['ealgis'],
      scripts=['scripts/ealgis'],
      zip_safe=False,
)


