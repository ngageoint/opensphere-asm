describe('init', function() {
  var originalTimeout;
  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5500;
  });

  it('should wait for osasm module', function(done) {
    if (!window.osasm) {
      setTimeout(function() {
        expect(!!osasm).toBe(true);
        done();
      }, 2000);
    } else {
      done();
    }
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });
});
