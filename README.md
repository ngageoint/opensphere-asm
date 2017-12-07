# OpenSphere ASM

WebAssembly and asm.js module for [OpenSphere](https://github.com/ngageoint/opensphere). Built with
[emscripten](https://github.com/kripken/emscripten).

These modules are primarily used to expose functions for the geodesic
direct/inverse problem, the rhumb direct/inverse problem, and MGRS conversions 
provided by the excellent
[GeographicLib](https://geographiclib.sourceforge.io/) by Charles Karney.
The library includes a [partial JS port](https://www.npmjs.com/package/geographiclib)
for the geodesic calculations, but not for the others. Another plus from this
module is the increased performance over pure JS.

## Prerequisites

See [prerequisites for emscripten](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html)

tl;dr: You need a working compiler chain, java, python, and git.

## Setup

1. Run `./dev-install.sh` to set up the emscripten environment. You can run this over and over to update the emscripten SDK and GeographicLib.
2. Run `npm install` to set up the tests

## Build

Run `npm run build` or `./build.sh`

The build is intended to be consumed by the [OpenSphere](https://github.com/ngageoint/opensphere)
web application. However, it is definitely possible to run similar `emcc` commands
to produce WebAssembly or asm.js for nodejs.

## Try it

Point a browser at `example.html` and hit the test button.

## Development

Good candidates for additions to the ASM module:

* More functions from GeographicLib as we need them
* Heavy computations which are run many times

Things to be careful of

* Watch the gzipped file size of the output. It is easy to explode it by adding libraries with many dependencies

## About

OpenSphere was developed at the National Geospatial-Intelligence Agency (NGA) in collaboration with BIT Systems. The government has "unlimited rights" and is releasing this software to increase the impact of government investments by providing developers with the opportunity to take things in new directions. The software use, modification, and distribution rights are stipulated within the Apache license.

## Pull Requests

If you'd like to contribute to this project, please make a pull request. We'll review the pull request and discuss the changes. All pull request contributions to this project will be released under the Apache license.

Software source code previously released under an open source license and then modified by NGA staff is considered a "joint work" (see 17 USC § 101); it is partially copyrighted, partially public domain, and as a whole is protected by the copyrights of the non-government authors and must be released according to the terms of the original open source license.

## License

Copyright 2017 BIT Systems

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
