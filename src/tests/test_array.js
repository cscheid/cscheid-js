import * as cscheid from "../cscheid.js";
import * as array from "../cscheid/array.js";
import * as test from "../cscheid/test.js";
import { assert } from "../cscheid/debug.js";

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

  av2.forEach((v, i) => assert(v === v1c[i]));
  av2.forEach((v, i) => assert(v === abc[i]));
  abc.forEach((v, i) => assert(v === v1c[i]));
}

function testArrayConcat()
{
  test.repeat(20, 
    test.withGenerators(
      testArrayConcatAssociative,
      generateRandomArray,
      generateRandomArray,
      generateRandomArray));
}

function testArraySumPrefixSumProperties(a)
{
  var s = cscheid.array.sum(a),
      prefixSum = cscheid.array.prefixSum(a);
  assert(s === prefixSum[prefixSum.length-1]);
  assert(cscheid.object.all(
    array.discreteDifferences(prefixSum)
      .map((v, i) => v === a[i])));
}

function testArraySum()
{
  // base simple test
  assert(cscheid.array.sum([1,2,3,4,5]) === 15);

  // now check properties
  test.repeat(20,
    test.withGenerators(
      testArraySumPrefixSumProperties,
      generateRandomArray));
}

function testArrayHistogram()
{
  function testArrayHistogram(a)
  {
    var mod = ~~(1 + Math.random() * 5);
    var h = array.histogram(a, v => v % mod);
    var s = 0;
    for (let v of h.values()) {
      s += v;
    }
    assert(s === a.length);
  }
  test.repeat(20,
    test.withGenerators(
      testArrayHistogram, generateRandomArray));
}

function testArray()
{
  testArrayConcat();
  testArraySum();
  testArrayHistogram();
}
