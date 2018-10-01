import * as blas from "./blas.js";

/**
 * higher-level linalg interface that doesn't care too much about
 * memory allocations.
 */


/**
 * returns v1 + v2
 * @param {v1} input v1
 * @param {v2} input v2
 * @returns {Float64Array} v1 + v2
 */
export function add(v1, v2) {
  let n = v1.length;
  let result = new Float64Array(v1.length);
  for (var i=0; i<n; ++i) {
    result[i] = v1[i] + v2[i];
  }
  return result;
}

/**
 * returns v1 - v2
 * @param {v1} input v1
 * @param {v2} input v2
 * @returns {Float64Array} v1 - v2
 */
export function sub(v1, v2) {
  let n = v1.length;
  let result = new Float64Array(n);
  for (var i=0; i<n; ++i) {
    result[i] = v1[i] - v2[i];
  }
  return result;
}

/**
 * returns v * k
 * @param {v} input v
 * @param {k} input k
 * @returns {Float64Array} v * k
 */
export function scale(v, k) {
  let n = v.length;
  let result = new Float64Array(n);
  for (var i=0; i<n; ++i) {
    result[i] = v[i] * k;
  }
  return result;
}

/**
 * returns the squared 2-norm of v
 * @param {v} input v
 * @returns {Number} ||v||_2^2
 */
export function norm2(v) {
  return blas.dot(v, v);
}
