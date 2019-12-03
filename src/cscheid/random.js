/** @module cscheid/random */

import * as cscheid from "../cscheid.js";

// plain box-muller
var hasPrevGauss = false, prevGauss;
export function normalVariate() {
  if (hasPrevGauss) {
    hasPrevGauss = false;
    return prevGauss;
  }
  var u1 = Math.random(), u2 = Math.random();
  var r = Math.sqrt(-2 * Math.log(u1));
  var theta = Math.PI * 2 * u2;
  hasPrevGauss = true;
  prevGauss = r * Math.cos(theta);
  return r * Math.sin(theta);
}

export function choose(lst) {
  var u = ~~(Math.random() * lst.length);
  return lst[u];
}

export function uniformRange(min, max) {
  var i = ~~(Math.random() * (max - min));
  return min + i;
}

export function uniformReal(lo, hi) {
  return Math.random() * (hi - lo) + lo;
}

//////////////////////////////////////////////////////////////////////////////
// A little library for writing random distributions. Meant to be
// convenient, not efficient.
// 
// a "distribution" is a function object in which repeated calls to the
// function return IID samples from that distribution

export const distributions = {};

// transform a distribution by a function of the resulting variate
distributions.transform = function(gen, f) {
  return () => f(gen());
};

distributions.bernoulli = function(p) {
  return function() {
    if (Math.random() < p) {
      return 1;
    } else {
      return 0;
    }
  };
};

distributions.uniform = function(lower, upper) {
  return function() {
    return uniformReal(lower, upper);
  };
};

distributions.gaussian1D = function(mu, sigma) {
  return distributions.transform(normalVariate, v => mu + sigma * v);
};

// axis-aligned variances only for now..
distributions.gaussian2D = function(mu, sigma) {
  var n = mu.length;
  var vecGen = distributions.iidVec(normalVariate, n);
  return function() {
    var normalVariate = vecGen();
    return cscheid.linalg.add(mu, cscheid.linalg.elementMul(normalVariate, sigma));
  };
};

// assumes dist is numeric
distributions.iidVec = function(dist, k) {
  return function () {
    var result = new Float64Array(k);
    for (var i = 0; i < k; ++i) {
      result[i] = dist();
    }
    return result;
  };
};

distributions.mixture = function(ds, ws) {
  if (ws === undefined) {
    return function() {
      return choose(ds)();
    };
  } else {
    var sumWeights = cscheid.array.prefixSum(ws);
    var mixtureDist = distributions.uniform(0, sumWeights[sumWeights.length - 1]);
    return function() {
      var u = mixtureDist();
      var i = cscheid.array.upperBound(sumWeights, u);
      return ds[i]();
    };
  }
};
