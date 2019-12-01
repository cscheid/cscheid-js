/** @module cscheid/data */

// THIS IS ALL DEPRECATED

/*global numeric */

import * as cscheid from "../cscheid.js";

export function leastSquares(X, y, lambda) {
  var effdf = 0;
  var s = numeric.svd(X), i;
  var dim = X[0].length;
  var UTy = numeric.dot(y, s.U); // U^T y = y^T U = dot(y, U)
  lambda = lambda || 0.0;
  for (i=0; i<dim; ++i) {
    effdf += Math.pow(s.S[i], 2) / (Math.pow(s.S[i], 2) + lambda);
    if (s.S[i] > cscheid.math.eps) {
      UTy[i] /= (s.S[i] + lambda);
    }
  }
  var sigmaInvUTv = UTy;
  var betaHat = numeric.dot(s.V, sigmaInvUTv);
  return {
    beta: betaHat,
    effdf: effdf,
    predict: function(x) {
      return numeric.dot(x, betaHat);
    }
  };
}

// predict on normalized columns
export function normalizedLeastSquares(X, y, lambda) {
  var averages = [], stdevs = [];
  var dim = X[0].length, i, j;
  for (i=0; i<dim; ++i) {
    averages[i] = 0;
    stdevs[i] = 0;
  }
  for (i=0; i<X.length; ++i) {
    for (j=0; j<dim; ++j) {
      var v = X[i][j];
      averages[j] += v;
      stdevs[j] += v * v;
    }
  }
  for (j=0; j<dim; ++j) {
    averages[j] /= X.length;
    stdevs[j] = Math.pow(stdevs[j]/X.length - Math.pow(averages[j], 2), 0.5);
  }
  var nX = [];
  for (i=0; i<X.length; ++i) {
    var row = [];
    for (j=0; j<dim; ++j) {
      if (stdevs[j] > cscheid.math.eps) {
        row.push((X[i][j] - averages[j]) / stdevs[j]);
      } else {
        row.push(1.0); // X[i][j] / averages[j]
      }
    }
    nX.push(row);
  }
  var lstSq = leastSquares(nX, y);
  return {
    beta: lstSq.beta,
    effdf: lstSq.effdf,
    predict: function(x) {
      var nX = [], j;
      for (j=0; j<dim; ++j) {
        if (stdevs[j] > cscheid.math.eps) {
          nX.push((x[j] - averages[j]) / stdevs[j]);
        } else {
          nX.push(x[j] / averages[j]);
        }
      }
      return lstSq.predict(nX);
    }
  };
}
