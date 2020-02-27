import * as cscheid from '../cscheid.js';

export const __name__ = 'math';
export function runTests() {
  testMath();
}

// ////////////////////////////////////////////////////////////////////////////
// math

function testMath() {
  testLagrangePolynomial();
}

function testLagrangePolynomial() {
  function singleTest() {
    let xVals = [], yVals = [];
    let n = cscheid.random.uniformRange(3, 8);
    for (let i = 0; i < n; ++i) {
      xVals.push(cscheid.random.normalVariate());
      yVals.push(cscheid.random.normalVariate());
    }
    let f = cscheid.math.lagrangePolynomial(xVals, yVals);
    for (let i = 0; i < n; ++i) {
      let fx = f(xVals[i]);
      cscheid.debug.assert(cscheid.math.withinEpsRel(fx, yVals[i]));
    }
  }

  for (let i=0; i<100; ++i) {
    singleTest();
  }
}
