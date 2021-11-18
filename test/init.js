const originalJasmineTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

beforeAll(function() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 5500;
});

afterAll(function() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = originalJasmineTimeout;
});

if (!window.osasm || !window.osasm.geodesicDirect) {
  beforeEach(function(done) {
    const interval = 100;
    const timeout = 4000;
    let waited = 0;

    const osasmReady = () => !!window.osasm && !!osasm.geodesicDirect && !!osasm.toMGRS;
    const waitForOsasm = () => {
      if (!osasmReady() && waited < timeout) {
        waited += interval;
        setTimeout(waitForOsasm, interval);
      } else {
        done();
      }
    };

    waitForOsasm();
  });
}
