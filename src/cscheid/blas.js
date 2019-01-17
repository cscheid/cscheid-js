import * as cscheid from "../cscheid.js";

// BLAS-like basic linear algebra stuff
// emphasis on "like": many non-BLAS things here

//////////////////////////////////////////////////////////////////////////
// level 1 blas
// 
// FIXME: all of this is assuming inc* = 1

/** 
 * Normalizes the given vector and returns its length. Mutates `v`.
 *
 * @param {v} inout a vector
 * @returns {number} the length of the vector prior to normalization
 */
export function normalize(v)
{
  var s = 0;
  for (var i=0; i<v.length; ++i) {
    s += v[i] * v[i];
  }
  s = Math.sqrt(s);
  scal(1.0/s, v);

  return s;
}

/**
 * Scales given vector by alpha
 * 
 * @param {alpha} input scaling factor
 * @param {x} inout the vector
 */
export function scal(alpha, x)
{
  var n = x.length;
  for (var i=0; i<n; ++i) {
    x[i] *= alpha;
  }
}

/**
 * Assigns the values in x to y.
 * 
 * @param {x} input the source vector
 * @param {y} output the target vector
 */
export function copy(x, y)
{
  var n = x.length;
  for (var i=0; i<n; ++i) {
    y[i] = x[i];
  }
}

/**
 * Assigns to y the value y + alpha x
 *
 * @param {x} input a vector
 * @param {alpha} input a scaling factor
 * @param {y} inout the output vector
 */
export function axpy(alpha, x, y)
{
  var n = x.length;
  for (var i=0; i<n; ++i) {
    y[i] = alpha * x[i] + y[i];
  }
}

/**
 * Assigns to y the value b * y + a * x
 *
 * @param {x} input a vector
 * @param {alpha} input a scaling factor
 * @param {y} inout output vector
 */
export function axby(a, x, b, y)
{
  var n = x.length;
  for (var i=0; i<n; ++i) {
    y[i] = a * x[i] + b * y[i];
  }
}

/**
 * Returns the dot product of x and y
 *
 * @param {x} input a vector
 * @param {y} input another vector
 * @returns {number} the inner product
 */
export function dot(x, y)
{
  var n = x.length;
  var r = 0;
  for (var i=0; i<n; ++i) {
    r += x[i] * y[i];
  }
  return r;
}
