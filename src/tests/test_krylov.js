import * as cscheid from '../cscheid.js';

export const __name__ = 'krylov';
export function runTests() {
  testKrylov();
}

// ////////////////////////////////////////////////////////////////////////////
// krylov

function testKrylov() {
  testPowerIteration();
  testInversePowerIteration();
}

function Av(v) {
  // [ 2 1 ]
  // [ 1 2 ]
  return new Float64Array([v[0] * 2 + v[1], v[0] + v[1] * 2]);
}

function testPowerIteration() {
  cscheid.krylov.powerIteration(Av, 2);
}

function testInversePowerIteration() {
  cscheid.krylov.inversePowerIteration(Av, 2);
}

