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
