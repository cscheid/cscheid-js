/** @module cscheid/geometry/sinkhorn */

import * as cscheid from "../../cscheid.js";

/**
 * Returns the entropy-regularized approximation of optimal transport
 * from Cuturi's NeurIPS 2013 paper.
 * 
 * This is described in page 5 of 
 * https://papers.nips.cc/paper/4927-sinkhorn-distances-lightspeed-computation-of-optimal-transport.pdf
 *
 * Notice that the notation of the paper is a little strange in that
 * the transport matrix needs to be multiplied on the *left* by the
 * source distribution to produce the target distribution.
 *
 * @param {Array} source - |m| array describing source distribution
 * @param {Array} target - |n| array describing target distribution
 * @param {Array} metric - m x n matrix describing metric space
 * @param {number} lambda - regularization
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
  let u = (new Float64Array(r.length)).fill(1 / r.length);

  let eM = cscheid.linalg.elementMul, mM = cscheid.linalg.matVecMul;
  let inv = vec => vec.map(v => 1 / v);
  while (!cscheid.linalg.vecWithinEpsRel(oldU, u)) {
    oldU = u;
    // u = 1 / (k_tilde.dot(c / u.dot(k)))
    u = inv(mM(kTilde, eM(c, inv(mM(k, u, true, false)))));
  }
  let v = eM(c, inv(mM(k, u, true, false)));
  let d = cscheid.blas.dot(u, mM(cscheid.linalg.schurProduct(k, m), v));
  let pLambdaTrunc = cscheid.linalg.scaleRows(cscheid.linalg.scaleCols(k, v), u);
  let pLambda = [];
  let nZI = 0;
  i.forEach(v => {
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

/**
 * renders the distribution corresponding to partially moving to
 * transport. Suresh tells me that he knows of no obvious algorithms
 * to compute Frechet means under the Wasserstein metric, so we hack
 * it.
 * 
 * @param {Array} transport - a 2D matrix of dimensions (rows * cols) by
 * (rows * cols) representing the transportation solution
 * @param {Array} source - a vector of dimensions (rows * cols) in
 * row-major order, representing the input distribution
 * @param {number} rows - the number of rows
 * @param {number} cols - the number of columns
 * @param {number} t - the parameter for producing the partial
 * transport. if t = 0, produces the original source; if t = 1,
 * produces the final transport; if 0<t<1, attempts to reconstruct a
 * continuous function on the Wasserstein metric
 * @returns {Float64Array} a vector of dimensions (rows * cols)
 */
export function renderPartialImageTransport(transport, source, rows, cols, t)
{
  // here's our hack: the nonzero entries in the transport matrix
  // decompose the source distribution into "packets" that are
  // eventually transported to specific positions in the solution.

  // for each of these "packets", we write a linear equation of motion
  // pos(0) = source, pos(1) = destination.

  // we assume the packets are uniformly distributed over the square
  // cells at the source, and we splat the square cells on the
  // destination image at the appropriate locations using bilinear
  // interpolation.

  var result = new Float64Array(rows * cols);

  transport.forEach((row, transportRowIndex) => {
    row.forEach((value, transportColIndex) => {
      if (value === 0)
        return;
      // source address
      let sImageRow = ~~(transportRowIndex / cols);
      let sImageCol = transportRowIndex - sImageRow * cols;
      
      // target address
      let tImageRow = ~~(transportColIndex / cols);
      let tImageCol = transportColIndex - tImageRow * cols;
      let lerpRow = t * tImageRow + (1 - t) * sImageRow;
      let lerpCol = t * tImageCol + (1 - t) * sImageCol;
      let lerpRowLeft = ~~lerpRow,   lerpColLeft = ~~lerpCol;
      let u = lerpRow - lerpRowLeft, v = lerpCol - lerpColLeft;
      let baseAddr = lerpRowLeft * cols + lerpColLeft;
      let onRowInterior = lerpRowLeft < (rows - 1);
      let onColInterior = lerpColLeft < (cols - 1);
      
      result[baseAddr] += value * (1 - u) * (1 - v);
      if (onRowInterior) {
        result[baseAddr + cols] += value * u * (1 - v);
      }
      if (onColInterior) {
        result[baseAddr + 1] += value * (1 - u) * v;
      }
      if (onRowInterior && onColInterior) {
        result[baseAddr + cols + 1] += value * u * v;
      }
    });
  });
  
  return result;
}
