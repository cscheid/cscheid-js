import * as cscheid from "../cscheid.js";

export let __name__ = "array";
export function runTests()
{
  testArray();
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
  return result;
}

function testArrayConcatAssociative(a, b, c)
{
  var v1 = cscheid.array.concat([a, b]),
      v2 = cscheid.array.concat([b, c]);
  var av2 = cscheid.array.concat([a, v2]),
      v1c = cscheid.array.concat([v1, c]),
      abc = cscheid.array.concat([a, b, c]);

  av2.forEach((v, i) => cscheid.debug.assert(v === v1c[i]));
  av2.forEach((v, i) => cscheid.debug.assert(v === abc[i]));
  abc.forEach((v, i) => cscheid.debug.assert(v === v1c[i]));
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
