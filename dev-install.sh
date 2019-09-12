#!/bin/bash
set -e

if [ ! -d "tools/emsdk-portable" ]; then
  echo "Downloading emscripten sdk"
  mkdir -p tools
  pushd tools
  git clone https://github.com/emscripten-core/emsdk emsdk-portable
  popd
fi

echo "Set up emscripten sdk"
# set up the emscripten sdk
pushd tools/emsdk-portable
git pull
./emsdk install latest
./emsdk activate latest
popd

./ci-install.sh
