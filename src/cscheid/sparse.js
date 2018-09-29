import * as blas from "./blas.js";

/**
 * LSQR: A least-squares solver for sparse matrices
 *
 * Returns the vector that minimizes ||Ax - b||_2
 *
 * @param {AvFun} input a function that satisfies v -> A . v
 * @param {ATvFun} input a function that satisfies v -> A^T . v
 * @param {b} input the vector b
 * @returns {x} the vector that minimizes ||Ax - b||_2
 */
export function lsqr(AvFun, ATvFun, b)
{
  // direct transcription of LSQR on https://web.stanford.edu/class/cme324/paige-saunders2.pdf
  // FIXME: This does _not_ solve the ridge-regression version

  var atol = 1e-4;
  b = new Float64Array(b);

  // (1) (Initialize.)
  var beta = blas.normalize(b), u = b;
  var ATu = ATvFun(u);
  var alpha = blas.normalize(ATu);
  var v = ATu;
  var x = new Float64Array(b.length);
  var phiBar = beta;
  var rhoBar = alpha;
  var w = new Float64Array(v);

  var BkF = 0;
  var nIter = 0, maxIter = 100;

  do { // (for i = 1,2,3,...) repeat steps 3--6.

    // (3) (Continue the bidiagonalization)
    var tmp = AvFun(v);
    blas.axby(-alpha, u, 1, tmp);
    beta = blas.normalize(tmp);
    u = tmp;
    tmp = ATvFun(u);
    blas.axby(-beta, v, 1, tmp);
    alpha = blas.normalize(tmp);
    v = tmp;

    BkF += alpha * alpha + beta * beta; // from last paragraph of 5.3

    // (4) (Construct and apply next orthogonal transformation)
    var rho = Math.sqrt(rhoBar * rhoBar + beta * beta);
    var c = rhoBar / rho;
    var s = beta / rho;
    var theta = s * alpha;
    rhoBar = -c * alpha;
    var phi = c * phiBar;
    phiBar = s * phiBar;

    // (5) (Update x, w)
    blas.axby(phi / rho, w, 1, x);
    blas.axby(1, v, -theta / rho, w);

    // (6) (Test for convergence.)

    // we're using this for least squares, so we assume an incompatible system,
    // which asks for stopping criterion 2, namely that
    // || A^T r_k || / ||A|| ||r_k|| <= atol
    // || r_k || = phiBar   (5.2)
    // || A || = BkF
    // || A^T r_k || = phiBar alpha |c|
    //
    // var rkNorm = phiBar;
    // var ANorm = BkF;
    // var ATrkNorm = phiBar * alpha * Math.abs(c);

    var stoppingCriterion = alpha * Math.abs(c) / BkF; // phiBar cancels out
    ++nIter;
  } while (stoppingCriterion > atol && nIter < maxIter);

  return x;
}
