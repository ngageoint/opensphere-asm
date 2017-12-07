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

Module['postRun'] = [function() {
  Module['geodesicDirect'] = wrapDirect(Module['geodesicDirect']);
  Module['rhumbDirect'] = wrapDirect(Module['rhumbDirect']);
  Module['geodesicInverse'] = wrapInverse(Module['geodesicInverse']);
  Module['rhumbInverse'] = wrapInverse(Module['rhumbInverse']);
  Module['toMGRS'] = wrapSingle(Module['toMGRS']);
}];
window['osasm'] = Module;
})();

