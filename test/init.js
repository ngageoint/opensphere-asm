describe('init', function() {
  var originalTimeout;
  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5500;
  });

  it('should wait for osasm module', function() {
    if (!window.osasm) {
      setTimeout(function() {
        expect(!!window.osasm && !!window.osasm.geodesicInverse).toBe(true);
        done();
      }, 4000);
    } else {
      done();
    }
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });
});
