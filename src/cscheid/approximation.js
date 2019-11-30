import * as cscheid from "../cscheid.js";

/**
 * Given a dataset of (x_i, y_i) observations and a 1D linear function
 * space (a list of f_j: R->R), compute the best functional
 * approximation in an L2 sense to the given observations.
 *
 * Concretely, we find the minimizer of
 * 
 * E = ((\sum_i \sum_j beta_j f_j(x_i)) - y_i)^2 + \lambda \sum_j beta_j^2
 * 
 * over all possible vectors c = (beta_j)
 *
 * If normalize is true, we first standardize (transform linearly into
 * a zero-mean, unit-variance vector) each of the j vectors f_j(x_i).
 * This allows the regularization to affect each vector proportionally
 * to their 
 *
 * @param {data} input 
 *      data.xs: vector of x values
 *      data.ys: vector of y values
 * @param {space} input
 *      list of R->R functions
 * @param {lambda} input L^2 regularization
 * @param {standardize} input if true, standardize input
 * @returns {Object}
 *      beta: vector of best-fitting parameters
 *      averages: when standardize === true, returns column averages
 *      stdevs: when standardize === true, returns standard devs,
 *      effdf: effective degrees of freedom of the fit,
 *      predict: function to predict a single point
 */
export function leastSquaresLFS(data, space, lambda, standardize)
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

  if (standardize) {
    for (i = 0; i <= degree; ++i) {
      averages[i] = 0;
      stdevs[i] = 0;
    }
    stdevs[0] = 1;
    for (i = 0; i < data.xs.length; ++i) {
      for (j = 1; j <= degree; ++j) {
        var v = space[j](data.xs[i]);
        averages[j] += v;
        stdevs[j] += v * v;
      }
    }
    for (i = 1; i <= degree; ++i) {
      averages[i] /= data.xs.length;
      stdevs[i] = Math.pow(stdevs[i]/data.xs.length - Math.pow(averages[i], 2), 0.5);
    }
  } else {
    for (i = 0; i <= degree; ++i) {
      averages[i] = 0;
      stdevs[i] = 1;
    }
  }
  
  for (i = 0; i < data.xs.length; ++i) {
    var row = [];
    for (var j = 0; j <= degree; ++j) {
      row.push((space[j](data.xs[i]) - averages[j]) / stdevs[j]);
    }
    matrix.push(row);
  }

  var s = cscheid.linalg.svd(matrix);

  var effdf = 0;
  let sigmaCross = s.q.map(function(v, i) {
    effdf += v * v / (v * v + lambda);
    return 1 / (v + lambda);
  });

  let utv = cscheid.linalg.matVecMul(s.u, data.ys, true);
  let sigmaCrossUtv = cscheid.linalg.elementMul(sigmaCross, utv);
  let betaHat = cscheid.linalg.matVecMul(s.v, sigmaCrossUtv);
  
  var fit = {
    beta: betaHat,
    averages: averages,
    stdevs: stdevs,
    effdf: effdf,
    predict: function(x) {
      var result = 0;
      for (var i = 0; i < fit.beta.length; ++i) {
        result += ((space[i](x) - fit.averages[i]) / fit.stdevs[i]) * fit.beta[i];
      }
      return result;
    }
  };
  return fit;
}


/**
 * Find the best-fitting polynomial to a set of pointsusing the
 * monomial basis
 *
 * @param {data} input
 *      data.xs: vector of x values
 *      data.ys: vector of y values
 * @param {degree} input the degree of the polynomial to fit
 * @param {lambda} input regularization parameter
 * @param {standardize} input whether or not to standardize the columns
 * @returns {Object} the resulting leastSquaresFLS object
 */
export function polynomial(data, degree, lambda, standardize)
{
  return leastSquaresLFS(
    data,
    d3.range(0, degree+1).map(d => (x => Math.pow(x, d))),
    lambda, standardize);
}
