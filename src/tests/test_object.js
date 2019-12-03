import * as cscheid from '../cscheid.js';

/** the module name (for debugging) */
export const __name__ = 'object';

/** the test suite's needed export */
export function runTests() {
  testToArray();
}

// /////////////////////////////////////////////////////////////////////////////

/**
 * tests for toArray
 */
function testToArray() {
  // google doesn't like me using 'arguments' even for testing it :(
  const nonArrays = [{},
    'asd',
    new Int32Array([1, 2, 3])];
  nonArrays.forEach((obj) => {
    cscheid.debug.assert(!Array.isArray(obj));
    cscheid.debug.assert(Array.isArray(cscheid.object.toArray(obj)));
  });

  cscheid.debug.assert(Array.isArray(cscheid.object.toArray([1, 2, 3])));
}

