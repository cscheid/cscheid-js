// tests for cscheid/objects.js

import * as cscheid from '../cscheid.js';

export const __name__ = 'object';
export function runTests() {
  testToArray();
}

// ////////////////////////////////////////////////////////////////////////////

function testToArray() {
  const nonArrays = [arguments,
    {},
    'asd',
    new Int32Array([1, 2, 3])];
  nonArrays.forEach((obj) => {
    cscheid.debug.assert(!Array.isArray(obj));
    cscheid.debug.assert(Array.isArray(cscheid.object.toArray(obj)));
  });

  cscheid.debug.assert(Array.isArray(cscheid.object.toArray([1, 2, 3])));
}

