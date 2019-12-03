import * as cscheid from '../cscheid.js';

export const __name__ = 'linalg';
export function runTests() {
  testMuls();
}

// ////////////////////////////////////////////////////////////////////////////

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
  const b_cv = cscheid.linalg.matVecMul(b, cv);
  const bc_v = cscheid.linalg.matVecMul(bc, v);
  const bctt = cscheid.linalg.matMatMul(b, ct, false, true);
  const bctt2 = cscheid.linalg.matMatMul(bt, c, true, false);
  const bctt3 = cscheid.linalg.matMatMul(bt, ct, true, true);
  const bctt_v = cscheid.linalg.matVecMul(bctt, v);
  const bctt2_v = cscheid.linalg.matVecMul(bctt2, v);
  const bctt3_v = cscheid.linalg.matVecMul(bctt3, v);

  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(b_cv, bc_v));
  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(b_cv, bctt_v));
  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(b_cv, bctt2_v));
  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(b_cv, bctt3_v));
}

function testMuls() {
  // p < 0.05 ought to be enough for everyone, right?
  for (let i = 0; i < 20; ++i) {
    testMul();
  }
}
