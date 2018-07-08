from setuptools import setup, find_packages

with open("VERSION") as f:
    version = f.read().strip()

setup(
    author="Grahame Bowland and Keith Moss",
    author_email="grahame@oreamnos.com.au",
    description="ealgis",
    license="GPL3",
    keywords="gis",
    url="https://github.com/ealgis/ealgis",
    name="ealgis",
    version=version,
    packages=find_packages(exclude=["*.tests", "*.tests.*", "tests.*", "tests"]),
)
