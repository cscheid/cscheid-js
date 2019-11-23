import * as cscheid from "../../cscheid.js";

/**
 * Returns the entropy-regularized approximation of optimal transport
 * from Cuturi's NeurIPS 2013 paper.
 * 
 * This is described in page 5 of 
 * https://papers.nips.cc/paper/4927-sinkhorn-distances-lightspeed-computation-of-optimal-transport.pdf
 *
 * @param {source} input |m| array describing source distribution
 * @param {target} input |n| array describing target distribution
 * @param {metric} input m x n matrix describing metric space
 * @param {lambda} input regularization
 * @returns {Object} result.d: distance; result.p: transport matrix
 */

export function dualSinkhornDivergence(
  source, target, metric, lambda) {
  let c = target;
  let l = lambda;

  // here we're hurt by the lack of numpy/matlab syntax
  var i = source.map(v => v > 0);
  var nonZeroI = [];
  var r = [];
  i.forEach((v, ix) => {
    if (v) {
      r.push(source[ix]);
      nonZeroI.push(ix);
    }
  });
  // pick rows of metric that correspond to
  // nonzero entries of source
  let m = nonZeroI.map(ri => new Float64Array(metric[ri]));
  let k = cscheid.linalg.matMap(m, v => Math.exp(-l * v));
  let kTilde = cscheid.linalg.scaleRows(k, r.map(v => 1 / v));
  let oldU = new Float64Array(r.length);
  let u = (new Float64Array(r.length)).fill(1 / r);

  let eM = cscheid.linalg.elementMul, mM = cscheid.linalg.matVecMul;
  let inv = vec => vec.map(v => 1/v);
  while (cscheid.linalg.vecWithinEpsRel(oldU, u)) {
    oldU = u;
    // u = 1 / (k_tilde.dot(c / u.dot(k)))
    u = inv(mM(kTilde, eM(c, inv(mM(k, u, true, false)))));
  }
  let v = eM(c, inv(mM(k, u, true, false)));
  let d = cscheid.blas.dot(u, mM(cscheid.linalg.schurProduct(k, m), v));
  let pLambdaTrunc = cscheid.linalg.scaleRows(cscheid.linalg.scaleCols(k, v), u);
  let pLambda = [];
  let nZI = 0;
  i.forEach((v, ix) => {
    if (v) {
      // we can actually just refer to these instead of copying since
      // they'll never be used by anyone else
      pLambda.push(pLambdaTrunc[nZI++]);
    } else {
      pLambda.push(new Float64Array(c.length));
    }
  });
  return {
    d: d,
    p: pLambda
  };
}
