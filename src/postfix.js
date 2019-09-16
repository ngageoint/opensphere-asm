/**
 * @param {function(Array<number>, Array<number>):Object} func
 * @return {function(Array<number>, Array<number>):Object}
 */
var wrapInverse = function(func) {
  return (
    /**
     * @param {Array<number>} c1
     * @param {Array<number>} c2
     * @return {Object}
     */
    function(c1, c2) {
      if (c1.length > 2) {
        c1 = c1.slice(0, 2);
      }

      if (c2.length > 2) {
        c2 = c2.slice(0, 2);
      }

      return func(c1, c2);
    });
};

/**
 * @param {function(Array<number>, number, number):Array<number>} func
 * @return {function(Array<number>, number, number):Array<number>}
 */
var wrapDirect = function(func) {
  return (
    /**
     * @param {Array<number>} coord
     * @param {number} azi1
     * @param {number} s12
     */
    function(coord, azi1, s12) {
      if (coord.length > 2) {
        coord = coord.slice(0, 2);
      }

      return func(coord, azi1, s12);
    });
};

/**
 * @param {function(Array<number>):*} func
 * @return {function(Array<number>):*}
 */
var wrapSingle = function(func) {
  return (
    /**
     * @param {Array<number>} p
     * @return *
     */
    function(c) {
      if (c.length > 2) {
        c = c.slice(0, 2);
      }

      return func(c);
    });
};


/**
 * @param {function(Array<number>, Array<number>, number):*} func
 * @return {function(Array<number>, Array<number>, number):*}
 */
var wrapIntersection = function(func) {
  return (
    /**
     * @param {Array<number>} p1
     * @param {Array<number>} p2
     * @param {number} meridian
     */
    function(p1, p2, meridian) {
      if (p1.length > 2) {
        p1 = p1.slice(0, 2);
      }

      if (p2.length > 2) {
        p2 = p2.slice(0, 2);
      }

      return func(p1, p2, meridian);
    });
};

Module['postRun'] = [function() {
  Module['geodesicDirect'] = wrapDirect(Module['geodesicDirect']);
  Module['geodesicInverse'] = wrapInverse(Module['geodesicInverse']);
  Module['geodesicMeridianIntersection'] = wrapIntersection(Module['geodesicMeridianIntersection']);

  Module['rhumbDirect'] = wrapDirect(Module['rhumbDirect']);
  Module['rhumbInverse'] = wrapInverse(Module['rhumbInverse']);
  Module['rhumbMeridianIntersection'] = wrapIntersection(Module['rhumbMeridianIntersection']);

  Module['toMGRS'] = wrapSingle(Module['toMGRS']);
}];

if (isBrowser()) {
  window['osasm'] = Module;
}
