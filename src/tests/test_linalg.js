import * as cscheid from '../cscheid.js';

/** the module name (for debugging) */
export const __name__ = 'linalg';

/** the test suite's needed export */
export function runTests() {
  testMuls();
}

// ////////////////////////////////////////////////////////////////////////////

/**
 * Test multiplication routines
 */
function testMul() {
  const n = cscheid.random.uniformRange(1, 10);
  const o = cscheid.random.uniformRange(1, 10);
  const p = cscheid.random.uniformRange(1, 10);

  function randomMatrix(m, n) {
    const result = [];
    for (let i = 0; i < m; ++i) {
      const row = new Float64Array(n);
      for (let j = 0; j < n; ++j) {
        row[j] = cscheid.random.normalVariate();
      }
      result.push(row);
    }
    return result;
  }
  function randomVector(p) {
    const result = new Float64Array(p);
    for (let i = 0; i < p; ++i) {
      result[i] = cscheid.random.normalVariate();
    }
    return result;
  }
  const b = randomMatrix(n, o);
  const bt = cscheid.linalg.transpose(b);
  const c = randomMatrix(o, p);
  const ct = cscheid.linalg.transpose(c);
  const v = randomVector(p);

  const bc = cscheid.linalg.matMatMul(b, c);
  const cv = cscheid.linalg.matVecMul(c, v);
  const bCv = cscheid.linalg.matVecMul(b, cv);
  const bcV = cscheid.linalg.matVecMul(bc, v);
  const bctt = cscheid.linalg.matMatMul(b, ct, false, true);
  const bctt2 = cscheid.linalg.matMatMul(bt, c, true, false);
  const bctt3 = cscheid.linalg.matMatMul(bt, ct, true, true);
  const bcttV = cscheid.linalg.matVecMul(bctt, v);
  const bctt2V = cscheid.linalg.matVecMul(bctt2, v);
  const bctt3V = cscheid.linalg.matVecMul(bctt3, v);

  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(bCv, bcV));
  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(bCv, bcttV));
  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(bCv, bctt2V));
  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(bCv, bctt3V));
}

/** Randomized test driver */
function testMuls() {
  // p < 0.05 ought to be enough for everyone, right?
  for (let i = 0; i < 20; ++i) {
    testMul();
  }
}
