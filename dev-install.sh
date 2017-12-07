#!/bin/sh
set -e

if [ ! -d "tools/emsdk-portable" ]; then
  echo "Downloading emscripten sdk"
  mkdir -p tools
  pushd tools
  SDK_URL='https://s3.amazonaws.com/mozilla-games/emscripten/releases/emsdk-portable.tar.gz'
  curl -s "$SDK_URL" -o emsdk.tar.gz
  tar xf emsdk.tar.gz
  popd
fi

echo "Set up emscripten sdk"
# set up the emscripten sdk
pushd tools/emsdk-portable
./emsdk update
./emsdk install latest
./emsdk activate latest
popd

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
