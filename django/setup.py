from setuptools import setup, find_packages
from ealgis.util import get_version

setup(
    author="Grahame Bowland and Keith Moss",
    author_email="grahame@oreamnos.com.au",
    description="ealgis",
    license="GPL3",
    keywords="gis",
    url="https://github.com/ealgis/ealgis",
    name="ealgis",
    version=get_version(),
    packages=find_packages(exclude=["*.tests", "*.tests.*", "tests.*", "tests"]),
)
