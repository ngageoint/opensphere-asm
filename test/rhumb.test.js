describe('rhumb', function() {
  // 1mm precision
  var distPrecision = 3;
  var degPrecision = 6;

  var data = [{
    p1: [0, 0, 10, 4, 5],
    p2: [0, 90],
    distance: 10001965.729,
    bearing: 0
  },{
    p1: [0, 0],
    p2: [0, 90],
    distance: 10001965.729,
    bearing: 0
  }, {
    p1: [174.81, -41.32],
    p2: [-5.5, 40.96],
    distance: 20361973.587,
    bearing: 63.41578415
  }, {
    p1: [0, 36.493349428792],
    p2: [0.0000008, 36.49334942879201],
    distance: 0.072,
    bearing: 89.99999911
  }];

  it('should correctly solve the inverse rhumb problem', function() {
    data.forEach(function(d) {
      var result = osasm.rhumbInverse(d.p1, d.p2);
      expect(result.distance).toBeCloseTo(d.distance, distPrecision);
      expect(result.bearing).toBeCloseTo(d.bearing, degPrecision);
    });
  });

  it('should correctly solve the direct rhumb problem', function() {
    data.forEach(function(d) {
      var result = osasm.rhumbDirect(d.p1, d.bearing, d.distance);
      expect(result[0]).toBeCloseTo(d.p2[0], degPrecision);
      expect(result[1]).toBeCloseTo(d.p2[1], degPrecision);
    });
  });

  it('should interpolate rhumb lines', function() {
    var numPoints = 10;
    var ptr = osasm._malloc(2 * numPoints * Float64Array.BYTES_PER_ELEMENT);
    osasm.rhumbInterpolate([1, 1], [10, 10], ptr, numPoints);
    var flatCoords = new Float64Array(osasm.HEAPU8.buffer, ptr, 2 * numPoints);
    for (var i = 0, n = flatCoords.length; i < n; i++) {
      expect(isNaN(flatCoords[i])).toBe(false);
      expect(flatCoords[i]).toBeGreaterThan(0);
    }
    osasm._free(ptr);
  });

  it('should find rhumb line intersection with a given meridian', function() {
    const tests = [{
      p1: [-5, 0, 15], p2: [4, 0, 12], m: 0,
      expected: [0, 0]
    }, {
      p1: [178, 0, 15], p2: [-177, 0, 12], m: -180,
      expected: [-180, 0]
    }];

    tests.forEach((test) => {
      let result = osasm.rhumbMeridianIntersection(test.p1.slice(), test.p2.slice(), test.m);
      expect(result[0]).toBeCloseTo(test.expected[0], 7);
      expect(result[1]).toBe(test.expected[1]);

      // flip the points around and run it again
      const swp = test.p1;
      test.p1 = test.p2;
      test.p2 = swp;

      result = osasm.rhumbMeridianIntersection(test.p1.slice(), test.p2.slice(), test.m);
      expect(result[0]).toBeCloseTo(test.expected[0], 7);
      expect(result[1]).toBe(test.expected[1]);
    });
  });
});
