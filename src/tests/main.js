import * as cscheid from "../cscheid.js";
window.cscheid = cscheid;

//////////////////////////////////////////////////////////////////////////////
// krylov

function Av(v) {
  // [ 2 1 ]
  // [ 1 2 ]
  return new Float64Array([v[0] * 2 + v[1], v[0] + v[1] * 2]);
}

function testPowerIteration()
{
  cscheid.krylov.powerIteration(Av, 2);
}

function testInversePowerIteration()
{
  cscheid.krylov.inversePowerIteration(Av, 2);
}

export function testAll()
{
  debugger;
  testPowerIteration();
  testInversePowerIteration();
}

testAll();
