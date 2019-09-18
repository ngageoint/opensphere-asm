describe('geodesic', function() {
  // 1mm precision
  var distPrecision = 3;
  var degPrecision = 6;

  var data = [{
    // should ignore other dimensions
    p1: [-73.80000000, 40.60000000, 123, 456],
    p2: [2.55000000, 49.01666667],
    distance: 5853226.256,
    initialBearing: 53.47021824,
    finalBearing: 111.59366952
  },{
    // GeodSolve0
    p1: [-73.80000000, 40.60000000],
    p2: [2.55000000, 49.01666667],
    distance: 5853226.256,
    initialBearing: 53.47021824,
    finalBearing: 111.59366952
  }, {
    // GeodSolve1
    p1: [-73.77888889, 40.63972222],
    p2: [2.56106226, 49.01466893],
    distance: 5850000.000,
    initialBearing: 53.50000000,
    finalBearing: 111.62946706
  }, {
    // GeodSolve2
    p1: [0, 0.07476],
    p2: [180, -0.07476],
    distance: 20003931.459,
    initialBearing: 0,
    finalBearing: 180
  }, {
    // GeodSolve3
    p1: [0, 0.1],
    p2: [180, -0.1],
    distance: 20003931.459,
    initialBearing: 0,
    finalBearing: 180
  }, {
    // GeodSolve4
    p1: [0, 36.493349428792],
    p2: [0.0000008, 36.49334942879201],
    distance: 0.072,
    initialBearing: 89.99999887,
    finalBearing: 89.99999935
  }, {
    // GeodSolve5
    p1: [30.00000000, 0.01777746],
    p2: [-150, 90],
    distance: 10000000.000,
    initialBearing: 0,
    finalBearing: 180
  }, {
    // GeodSolve6
    p1: [0, 88.20249945],
    p2: [179.98102203, -88.20249945],
    distance: 20003898.214,
    initialBearing: 90,
    finalBearing: 90
  }, {
    // GeodSolve7
    p1: [0, 89.26208039],
    p2: [179.99220798, -89.26208039],
    distance: 20003925.854,
    initialBearing: 90,
    finalBearing: 90
  }];

  it('should correctly solve the inverse geodesic problem', function() {
    data.forEach(function(d) {
      var result = osasm.geodesicInverse(d.p1, d.p2);
      expect(result.distance).toBeCloseTo(d.distance, distPrecision);
      expect(result.initialBearing).toBeCloseTo(d.initialBearing, degPrecision);
      expect(result.finalBearing).toBeCloseTo(d.finalBearing, degPrecision);
    });
  });

  it('should correctly solve the direct geodesic problem', function() {
    data.forEach(function(d) {
      var result = osasm.geodesicDirect(d.p1, d.initialBearing, d.distance);
      expect(result.length).toBe(d.p2.length);
      expect(result[0]).toBeCloseTo(d.p2[0], degPrecision);
      expect(result[1]).toBeCloseTo(d.p2[1], degPrecision);

      result = d.p2.slice();
      result[2] = 987;
      result[3] = 543;

      var r = osasm.geodesicDirect(d.p1, d.initialBearing, d.distance, result);
      expect(r).toBe(result);
      expect(result[0]).toBeCloseTo(d.p2[0], degPrecision);
      expect(result[1]).toBeCloseTo(d.p2[1], degPrecision);
      expect(result[2]).toBe(987);
      expect(result[3]).toBe(543);
    });
  });

  it('should interpolate geodesic lines', function() {
    var numPoints = 10;
    var ptr = osasm._malloc(2 * numPoints * Float64Array.BYTES_PER_ELEMENT);
    osasm.geodesicInterpolate([1, 1], [10, 10], ptr, numPoints);
    var flatCoords = new Float64Array(osasm.HEAPU8.buffer, ptr, 2 * numPoints);
    for (var i = 0, n = flatCoords.length; i < n; i++) {
      expect(isNaN(flatCoords[i])).toBe(false);
      expect(flatCoords[i]).toBeGreaterThan(0);
    }
    osasm._free(ptr);
  });

  it('should find geodesic line intersection with a given meridian', function() {
    const tests = [{
      p1: [-5, 0, 15], p2: [4, 0, 12], m: 0,
      expected: [0, 0]
    }, {
      p1: [178, 0, 15], p2: [-177, 0, 12], m: -180,
      expected: [-180, 0]
    }];

    tests.forEach((test) => {
      let result = osasm.geodesicMeridianIntersection(test.p1.slice(), test.p2.slice(), test.m);
      expect(result[0]).toBeCloseTo(test.expected[0], 7);
      expect(result[1]).toBe(test.expected[1]);

      // flip the points around and run it again
      const swp = test.p1;
      test.p1 = test.p2;
      test.p2 = swp;

      result = osasm.geodesicMeridianIntersection(test.p1.slice(), test.p2.slice(), test.m);
      expect(result[0]).toBeCloseTo(test.expected[0], 7);
      expect(result[1]).toBe(test.expected[1]);
    });
  });
});
