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

function testKrylov()
{
  testPowerIteration();
  testInversePowerIteration();
}

//////////////////////////////////////////////////////////////////////////////
// array

// generate random integer array. note that size of array is drawn
// from U(0,size), and and the size of the elements are drawn from I(0,size)
function generateRandomArray(size, elSize)
{
  size = size || 16;
  elSize = elSize || 4;
  var n = ~~(Math.random() * size);
  var result = [];
  for (var i=0; i<n; ++i) {
    result.push(~~(Math.random() * elSize));
  }
}

function testArrayConcatAssociative(a, b, c)
{
  var v1 = cscheid.array.concat([a, b]),
      v2 = cscheid.array.concat([b, c]);
  assert(cscheid.array.concat([a, v2]) === cscheid.array.concat([v1, c]));
  assert(cscheid.array.concat([a, v2]) === cscheid.array.concat([a, b, c]));
  assert(cscheid.array.concat([a, b, c]) === cscheid.array.concat([v1, c]));
}

function testArrayConcat()
{
  for (var i=0; i < 20; ++i) {
    var a = generateRandomArray(),
        b = generateRandomArray(),
        c = generateRandomArray();
    testArrayConcatAssociative(a, b, c);
  }
}

function testArray()
{
  testArrayConcat();
}

//////////////////////////////////////////////////////////////////////////////

export function testAll()
{
  testKrylov();
  testArray();
}

//////////////////////////////////////////////////////////////////////////////

function assert(v, msg)
{
  if (!v) {
    debugger;
    throw new Error("Assertion failed! " + (msg || "")); 
  }
}
testAll();
