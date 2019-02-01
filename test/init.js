beforeAll(function(done) {
  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 5500;

  if (!window.osasm) {
    setTimeout(function() {
      expect(!!window.osasm && !!window.osasm.geodesicInverse).toBe(true);
      done();
    }, 4000);
  } else {
    done();
  }
});

afterAll(function() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
});
