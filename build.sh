#!/bin/bash

set -e
mkdir -p dist
rm -rf dist/*

cp src/load.js dist/os-load.js

GEO_PATH=lib/geographiclib

BASE_ARGS="--bind -O3 --pre-js src/prefix.js --post-js src/postfix.js --llvm-lto 1 \
  -s NO_FILESYSTEM=1 -I$GEO_PATH/include/"
GEO_ARGS=""
SRC_ARGS="src/bindings.cpp $GEO_PATH/src/*.cpp"
# The LEGACY_VM_SUPPORT is for asm.js output to work in IE11.
ASM_ARGS="-s WASM=0 -s LEGACY_VM_SUPPORT=1 --closure 0 -o dist/os-asm.js"
WASM_ARGS="-s WASM=1 -o dist/os-wasm.js"

if [[ -d "tools" ]]; then
  # source the emscripten environment for dev builds
  source tools/emsdk-portable/emsdk_env.sh
fi

echo "Building Web Assembly..."
echo emcc $BASE_ARGS $WASM_ARGS $GEO_ARGS ... src
emcc $BASE_ARGS $WASM_ARGS $GEO_ARGS $SRC_ARGS
echo -e '(function(){' > dist/os-wasm.js.new
cat dist/os-wasm.js >> dist/os-wasm.js.new
echo -e '})()' >> dist/os-wasm.js.new
mv dist/os-wasm.js.new dist/os-wasm.js

echo "Building asm.js..."
echo emcc $BASE_ARGS $ASM_ARGS $GEO_ARGS ... src
emcc $BASE_ARGS $ASM_ARGS $GEO_ARGS $SRC_ARGS
echo -e '(function(){' > dist/os-asm.js.new
cat dist/os-asm.js >> dist/os-asm.js.new
echo -e '})()' >> dist/os-asm.js.new
mv dist/os-asm.js.new dist/os-asm.js
