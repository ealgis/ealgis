from setuptools import setup, find_packages

setup(
    author="Grahame Bowland and Keith Moss",
    author_email="grahame@oreamnos.com.au",
    description="ealgis",
    license="GPL3",
    keywords="gis",
    url="https://github.com/grahame/dividebatur",
    name="ealgis",
    version="1.9.0",
    packages=find_packages(exclude=["*.tests", "*.tests.*", "tests.*", "tests"]),
)
