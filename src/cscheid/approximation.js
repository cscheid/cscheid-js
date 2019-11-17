import * as cscheid from "../cscheid.js";

export function leastSquaresLFS(data, space, lambda, normalize)
{
  var i;
  var matrix = [];
  // compute column averages
  var averages = [];
  var stdevs = [];
  
  cscheid.debug.assert(data !== undefined, "need data");
  cscheid.debug.assert(space !== undefined, "need space");
  var degree = space.length-1;
  cscheid.debug.assert(data.xs !== undefined, "need data.xs");
  cscheid.debug.assert(data.ys !== undefined, "need data.ys");
  lambda = lambda || 1e-10;

  if (normalize) {
    for (i=0; i<=degree; ++i) {
      averages[i] = 0;
      stdevs[i] = 0;
    }
    stdevs[0] = 1;
    for (i=0; i<data.xs.length; ++i) {
      for (j=1; j<=degree; ++j) {
        var v = space[j](data.xs[i]);
        averages[j] += v;
        stdevs[j] += v * v;
      }
    }
    for (i=1; i<=degree; ++i) {
      averages[i] /= data.xs.length;
      stdevs[i] = Math.pow(stdevs[i]/data.xs.length - Math.pow(averages[i], 2), 0.5);
    }
  } else {
    for (i=0; i<=degree; ++i) {
      averages[i] = 0;
      stdevs[i] = 1;
    }
    stdevs[0] = 1;
  }
  
  for (i=0; i<data.xs.length; ++i) {
    var row = [];
    for (var j=0; j<=degree; ++j) {
      row.push((space[j](data.xs[i]) - averages[j]) / stdevs[j]);
    }
    matrix.push(row);
  }

  var s = cscheid.linalg.svd(matrix);
  // var s = numeric.svd(matrix);

  // horrible, horrible. FIXME: don't make a diagonal matrix.
  // var sigmaInv = numeric.diag(s.S);
  var effdf = 0;
  for (i=0; i<=degree; ++i) {
    effdf += Math.pow(s.q[i], 2) / (Math.pow(s.q[i], 2) + lambda);
    s.q[i] = 1.0 / (s.q[i] + lambda);
    // sigmaInv[i][i] = 1.0 / (sigmaInv[i][i] + lambda);
  }

  s.u.forEach((rowVec, i) => cscheid.blas.scal(s.q[i], rowVec));
  let betaHat = cscheid.linalg.matVecMul(
    s.v,
    cscheid.linalg.matVecMul(s.u, data.ys, true));
  
  var fit = {
    beta: betaHat,
    averages: averages,
    stdevs: stdevs,
    effdf: effdf,
    predict: function(x) {
      var result = 0;
      for (var i=0; i<fit.beta.length; ++i) {
        result += ((space[i](x) - fit.averages[i]) / fit.stdevs[i]) * fit.beta[i];
      }
      return result;
    }
  };
  return fit;
}

export function polynomial(data, degree, lambda, normalize)
{
  return leastSquaresLFS(
    data,
    d3.range(0, degree+1).map(d => (x => Math.pow(x, d))),
    lambda, normalize);
}
