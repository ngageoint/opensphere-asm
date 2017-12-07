describe('mgrs conversion', function() {
  it('should convert lon/lat to mgrs', function() {
    var p = [44.4, 33.3, 0, 10];
    expect(osasm.toMGRS(p)).toBe('38SMB4414084706');

    p = [45.0, 0.00058];
    expect(osasm.toMGRS(p)).toBe('38NNF0000000064');

    p = [-32.664, 83.627];
    expect(osasm.toMGRS(p)).toBe('25XEN0416386465');
  });

  it('should convert from mgrs to lon/lat', function() {
    var precision = 5;

    var p = osasm.toLonLat('38NNF0000000064'); 
    expect(p[0]).toBeCloseTo(45.0, precision);
    expect(p[1]).toBeCloseTo(0.00058, precision);

    p = osasm.toLonLat('38SMB4414084706');
    expect(p[0]).toBeCloseTo(44.4, precision);
    expect(p[1]).toBeCloseTo(33.3, precision);

    p = osasm.toLonLat('13SED1714696655');
    expect(p[0]).toBeCloseTo(-104.79994, precision);
    expect(p[1]).toBeCloseTo(39.71960049119654, precision);

    p = osasm.toLonLat('25XEN0416386465');
    expect(p[0]).toBeCloseTo(-32.66403230449777, precision);
    expect(p[1]).toBeCloseTo(83.62700, precision);
  });  

  it('should support converting to polar regions', function() {
    var p = [-89, 89];
    expect(osasm.toMGRS(p)).toBe('YYG8899098062');

    p = [89, 89];
    expect(osasm.toMGRS(p)).toBe('ZBG1100998062');

    p = [89, -89];
    expect(osasm.toMGRS(p)).toBe('BBN1100901937');

    p = [-89, -89];
    expect(osasm.toMGRS(p)).toBe('AYN8899001937');
  });

  it('should support converting from polar regions', function() {
    var p = osasm.toLonLat('YYG8899098062');
    expect(p[0]).toBeCloseTo(-89.00009185943141, 5);
    expect(p[1]).toBeCloseTo(89, 5);

    p = osasm.toLonLat('ZBG1100998062');
    expect(p[0]).toBeCloseTo(89.00009185943141, 5);
    expect(p[1]).toBeCloseTo(89, 5);

    p = osasm.toLonLat('BBN1100901937');
    expect(p[0]).toBeCloseTo(89.00009185943141, 5);
    expect(p[1]).toBeCloseTo(-89, 5);

    p = osasm.toLonLat('AYN8899001937');
    expect(p[0]).toBeCloseTo(-89.00009185943141, 5);
    expect(p[1]).toBeCloseTo(-89, 5);
  });
 
  it('should not encounter rounding errors in coordinate conversion', function() {
    var tests = [
      '42QYM0127736076', '38SMB4414084706', '38NNF0000000064', '25XEN0416386465',
      'YYG8899098062', 'ZBG1100998062', 'BBN1100901937', 'AYN8899001937'];

    tests.forEach(function(test) {
      var lonlat = osasm.toLonLat(test);
      var result = osasm.toMGRS(lonlat);
      expect(result).toBe(test);
    });
  });
});
