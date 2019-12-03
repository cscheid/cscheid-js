import * as cscheid from '../cscheid.js';
import * as array from '../cscheid/array.js';
import * as test from '../cscheid/test.js';
import {assert} from '../cscheid/debug.js';

export const __name__ = 'array';
export function runTests() {
  testArray();
}

// ////////////////////////////////////////////////////////////////////////////
// array

// generate random integer array. note that size of array is drawn
// from U(0,size), and and the size of the elements are drawn from I(0,size)
function generateRandomArray(size, elSize) {
  size = size || 16;
  elSize = elSize || 4;
  const n = ~~(Math.random() * size);
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(~~(Math.random() * elSize));
  }
  return result;
}

function testArrayConcatAssociative(a, b, c) {
  const v1 = cscheid.array.concat([a, b]);
  const v2 = cscheid.array.concat([b, c]);
  const av2 = cscheid.array.concat([a, v2]);
  const v1c = cscheid.array.concat([v1, c]);
  const abc = cscheid.array.concat([a, b, c]);

  av2.forEach((v, i) => assert(v === v1c[i]));
  av2.forEach((v, i) => assert(v === abc[i]));
  abc.forEach((v, i) => assert(v === v1c[i]));
}

function testArrayConcat() {
  test.repeat(20,
      test.withGenerators(
          testArrayConcatAssociative,
          generateRandomArray,
          generateRandomArray,
          generateRandomArray));
}

function testArraySumPrefixSumProperties(a) {
  const s = cscheid.array.sum(a);
  const prefixSum = cscheid.array.prefixSum(a);
  assert(s === prefixSum[prefixSum.length - 1]);
  assert(cscheid.object.all(
      array.discreteDifferences(prefixSum)
          .map((v, i) => v === a[i])));
}

function testArraySum() {
  // base simple test
  assert(cscheid.array.sum([1, 2, 3, 4, 5]) === 15);

  // now check properties
  test.repeat(20,
      test.withGenerators(
          testArraySumPrefixSumProperties,
          generateRandomArray));
}

function testArrayHistogram() {
  function testArrayHistogram(a) {
    const mod = ~~(1 + Math.random() * 5);
    const h = array.histogram(a, (v) => v % mod);
    let s = 0;
    for (const v of h.values()) {
      s += v;
    }
    assert(s === a.length);
  }
  test.repeat(20,
      test.withGenerators(
          testArrayHistogram, generateRandomArray));
}

function testArray() {
  testArrayConcat();
  testArraySum();
  testArrayHistogram();
}
