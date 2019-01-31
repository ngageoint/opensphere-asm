describe('init', function() {
  var originalTimeout;
  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5500;
  });

  it('should wait for osasm module', function() {
    waitsFor(function() {
      return !!window.osasm && !!window.osasm.geodesicInverse;
    }, 5000, 'osasm to load');

    runs(function() {
        expect(!!osasm).toBe(true);
    });
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });
});
