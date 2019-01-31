// get path to current script
var script = document.currentScript;
if (!script) {
  var ss = document.getElementsByTagName('script');
  var i=ss.length;
  while(i--){
    if(ss[i].src.indexOf('/os-load.js')>-1){
      script=ss[i];
      break;
    }
  }
}

var path = script.src;

var locateFile = function(url) {
  if (url.indexOf('/') === -1) {
    return path.replace(/(^.*)\/.*?$/, '$1/' + url);
  }

  return url;
};

var Module = {
  'locateFile': locateFile,
  'wasmBinaryFile': locateFile('os-wasm.wasm')
};

// fetch skips credentials by default, we want our wasm loader to use it
var origFetch = window.fetch;
var fetch = function(url, options) {
  options = options || {};

  if (!options.credentials) {
    options.credentials = 'same-origin';
  }

  return origFetch(url, options);
};
