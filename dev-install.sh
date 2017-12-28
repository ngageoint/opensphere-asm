#!/bin/bash
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

./ci-install.sh
