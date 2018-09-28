import * as cscheid from "../cscheid.js";

export function bernstein(n, v) {
  var c = cscheid.math.choose(n, v);
  return function(x) {
    return c * Math.pow(x, v) * Math.pow(1-x, n-v);
  };
}
