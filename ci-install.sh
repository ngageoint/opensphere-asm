#!/bin/bash
set -e

echo "Set up libraries"
# set up libraries
if [ ! -d "lib" ]; then
  mkdir -p lib
fi

# GeographicLib library
echo "Download GeographicLib"
mkdir -p lib/geographiclib
rm -rf lib/geographiclib

GEOLIB='https://git.code.sf.net/p/geographiclib/code'
GEOLIB_BRANCH='release'
git clone --depth 1 "$GEOLIB" -b "$GEOLIB_BRANCH" lib/geographiclib
