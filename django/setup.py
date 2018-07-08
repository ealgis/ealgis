from setuptools import setup, find_packages

with open("version.py") as f:
    exec(f.read())

setup(
    author="Grahame Bowland and Keith Moss",
    author_email="grahame@oreamnos.com.au",
    description="ealgis",
    license="GPL3",
    keywords="gis",
    url="https://github.com/grahame/dividebatur",
    name="ealgis",
    version=__version__,
    packages=find_packages(exclude=["*.tests", "*.tests.*", "tests.*", "tests"]),
)
