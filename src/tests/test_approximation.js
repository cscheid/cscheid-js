// tests for cscheid/approximation.js
/* global d3*/
import * as cscheid from '../cscheid.js';

export const __name__ = 'approximation';
export function runTests() {
  testLeastSquaresLFS();
}

// ////////////////////////////////////////////////////////////////////////////

const runge = (x)=>1 / (x * x * 25 + 1);

function rangeKernel(mn, mx) {
  const c = 1 / (mx - mn);
  return ((x) => {
    // semi-open interval to avoid double-counting on edges
    if (x <= mn) return 0;
    if (x > mx) return 0;
    return c;
  });
}
function uniformLFS(mn, mx, steps) {
  const result = [];
  const r = mx - mn; const step = r / steps;
  for (let i = 0; i < steps; ++i) {
    result.push(rangeKernel(mn + i * step, mn + (i + 1) * step));
  }
  return result;
}

function sample(min, max, f, count) {
  const s = d3.scaleLinear().domain([0, count - 1]).range([min, max]);
  const vs = d3.range(count);
  return {xs: vs.map((x) => s(x)),
    ys: vs.map((x) => f(s(x)))};
}

function testLeastSquaresLFS() {
  // var sq3runge  =
  cscheid.approximation.leastSquaresLFS(
      sample(-1, 1, runge, 4), uniformLFS(-4 / 3, 4 / 3, 4));
  // var sq7runge  =
  cscheid.approximation.leastSquaresLFS(
      sample(-1, 1, runge, 8), uniformLFS(-8 / 7, 8 / 7, 8));
  // var sq11runge =
  cscheid.approximation.leastSquaresLFS(
      sample(-1, 1, runge, 12), uniformLFS(-12 / 11, 12 / 11, 12));


  const linearFitGoodEnough = cscheid.approximation.polynomial(
      sample(-1, 1, (d) => d, 20), 2
  );

  cscheid.debug.assert(
      cscheid.math.withinEps(linearFitGoodEnough.beta[2], 0));
}
