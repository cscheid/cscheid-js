import * as cscheid from "../cscheid.js";

export let __name__ = "linalg";
export function runTests()
{
  testMuls();
}

//////////////////////////////////////////////////////////////////////////////

function testMul()
{
  let n = cscheid.random.uniformRange(1, 10),
      o = cscheid.random.uniformRange(1, 10),
      p = cscheid.random.uniformRange(1, 10);

  function randomMatrix(m, n)
  {
    var result = [];
    for (var i = 0; i < m; ++i) {
      let row = new Float64Array(n);
      for (var j = 0; j < n; ++j) {
        row[j] = cscheid.random.normalVariate();
      }
      result.push(row);
    }
    return result;
  }
  function randomVector(p)
  {
    let result = new Float64Array(p);
    for (var i = 0; i < p; ++i) {
      result[i] = cscheid.random.normalVariate();
    }
    return result;
  }
  let b = randomMatrix(n, o),
      bt = cscheid.linalg.transpose(b),
      c = randomMatrix(o, p),
      ct = cscheid.linalg.transpose(c),
      v = randomVector(p);

  let bc     = cscheid.linalg.matMatMul(b, c),
      cv     = cscheid.linalg.matVecMul(c, v),
      b_cv   = cscheid.linalg.matVecMul(b, cv),
      bc_v   = cscheid.linalg.matVecMul(bc, v),
      bctt   = cscheid.linalg.matMatMul(b, ct, false, true),
      bctt2  = cscheid.linalg.matMatMul(bt, c, true, false),
      bctt3  = cscheid.linalg.matMatMul(bt, ct, true, true),
      bctt_v = cscheid.linalg.matVecMul(bctt, v),
      bctt2_v = cscheid.linalg.matVecMul(bctt2, v),
      bctt3_v = cscheid.linalg.matVecMul(bctt3, v);

  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(b_cv, bc_v));
  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(b_cv, bctt_v));
  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(b_cv, bctt2_v));
  cscheid.debug.assert(cscheid.linalg.vecWithinEpsRel(b_cv, bctt3_v));
}

function testMuls()
{
  // p < 0.05 ought to be enough for everyone, right?
  for (var i = 0; i < 20; ++i)
    testMul();
}
