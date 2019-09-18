
Module['postRun'] = [function() {
  var ptr = Module['_malloc'](3 * Float64Array.BYTES_PER_ELEMENT);
  var result = new Float64Array(Module['HEAPU8'].buffer, ptr, 3);

  var wrapDirect = function(func) {
    return (
      /**
       * @param {Array<number>} coord
       * @param {number} azi1
       * @param {number} s12
       * @param {Array<number>=} opt_result
       * @return {Array<number>}
       */
      function(coord, azi1, s12, opt_result) {
        opt_result = opt_result || [];
        func(coord[0], coord[1], azi1, s12, ptr);
        opt_result[0] = result[0];
        opt_result[1] = result[1];
        return opt_result;
      });
  };

  var wrapIntersection = function(func) {
    return (
      /**
       * @param {Array<number>} p1
       * @param {Array<number>} p2
       * @param {number} meridian
       * @param {Array<number>=} opt_result
       * @return {Array<number>}
       */
      function(p1, p2, meridian, opt_result) {
        opt_result = opt_result || [];
        func(p1[0], p1[1], p2[0], p2[1], meridian, ptr);
        opt_result[0] = result[0];
        opt_result[1] = result[1];
        return opt_result;
      });
  };

  var wrapInterpolate = function(func) {
    return (
      /**
       * @param {Array<number>} p1
       * @param {Array<number>} p2
       * @param {number} ptr
       * @param {number} numPoints
       */
      function(p1, p2, ptr, numPoints) {
        func(p1[0], p1[1], p2[0], p2[1], ptr, numPoints);
      });
  };


  Module['geodesicDirect'] = wrapDirect(Module['geodesicDirect_']);
  Module['geodesicMeridianIntersection'] = wrapIntersection(Module['geodesicMeridianIntersection_']);
  Module['geodesicInterpolate'] = wrapInterpolate(Module['geodesicInterpolate_']);
  Module['geodesicInverse'] = function(c1, c2, opt_result) {
    opt_result = opt_result || {};
    Module['geodesicInverse_'](c1[0], c1[1], c2[0], c2[1], ptr);
    opt_result['distance'] = result[0];
    opt_result['initialBearing'] = result[1];
    opt_result['finalBearing'] = result[2];
    return opt_result;
  };

  Module['rhumbDirect'] = wrapDirect(Module['rhumbDirect_']);
  Module['rhumbMeridianIntersection'] = wrapIntersection(Module['rhumbMeridianIntersection_']);
  Module['rhumbInterpolate'] = wrapInterpolate(Module['rhumbInterpolate_']);
  Module['rhumbInverse'] = function(c1, c2, opt_result) {
    opt_result = opt_result || {};
    Module['rhumbInverse_'](c1[0], c1[1], c2[0], c2[1], ptr);
    opt_result['distance'] = result[0];
    opt_result['bearing'] = result[1];
    return opt_result;
  };


  Module['toMGRS'] = function(c) {
    return Module['toMGRS_'](c[0], c[1]);
  };

  Module['toLonLat'] = function(mgrs, opt_result) {
    opt_result = opt_result || [];
    Module['toLonLat_'](mgrs, ptr);
    opt_result[0] = result[0];
    opt_result[1] = result[1];
    return opt_result;
  };
}];

if (isBrowser()) {
  window['osasm'] = Module;
}
