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

/**
 * returns the squared distance between v1 and v2
 * @param {v1} input v1
 * @param {v2} input v2
 * @returns {Number} ||v1 - v2||_2^2
 */
export function distance2(v1, v2) {
  return norm2(sub(v1, v2));
}

/**
 * normalizes the passed vector v. This mutates v!
 *
 * @param {v} inout v
 * @returns {Number} length of vector prior to normalization
 */
export function normalize(v) {
  var n = Math.sqrt(blas.dot(v, v));
  blas.scal(1.0/n, v);
  return n;
}

/**
 * multiplies a matrix by a vector. Assumes matrix
 * is stored as an array of appropriately-sized row vectors
 *
 * @param {m} input the matrix m
 * @param {v} input the vector v
 * @returns {Float64Array} mv
 */
export function matVecMult(m, v) {
  var result = new Float64Array(m.length);
  for (var i=0; i<m.length; ++i) {
    result[i] = blas.dot(m[i], v);
  }
  return result;
}

/**
 * returns the transpose of a matrix. Assumes
 * matrix is represented as an array of appropriately-sized row vectors
 *
 * @param {m} input the matrix m
 * @returns {Array[Float64Array]} m^T
 */
export function matTranspose(m) {
  var result = [];
  var nrows = m.length;
  var ncols = m[0].length;
  var i, j;
  for (i=0; i<ncols; ++i)
    result.push(new Float64Array(nrows));
  for (j=0; j<ncols; ++j) {
    for (i=0; i<nrows; ++i) {
      result[j][i] = m[i][j];
    }
  }
  return result;
}

/** 
 * returns the elementwise product of two vectors
 *
 * @param {v1} input v1
 * @param {v2} input v2
 * @returns {Array[Float64Array]} v_i = ( v1_i * v2_i )
 */
export function elementMul(v1, v2) {
  var n = v1.length;
  var result = new Float64Array(n);
  var i;
  for (i=0; i<n; ++i) {
    result[i] = v1[i] * v2[i];
  }
  return result;
}

/**
 * subtracts the row-wise average from every row. in other words, this
 * centers each column in the matrix
 *
 * @param {m} input the matrix m
 * @returns {Array[Float64Array]} centered matrix
 */
export function centerColumns(m) {
  var n = m.length;
  var z = new Float64Array(m[0].length);
  m.forEach(r => {
    blas.axpy(1/n, r, z);
  });
  return m.map(r => sub(r, z));
}

