import * as cscheid from "../cscheid.js";

export var eps = 1e-6;

/**
 * executes function with a different epsilon value
 *
 * @param {thisEps} input epsilon value with which to run function
 * @param {f} input function to run
 */
export function withEps(thisEps, f) {
  var oldEps = eps;
  try {
    eps = thisEps;
    return f();
  } finally {
    eps = oldEps;
  }
}

/**
 * returns true if v is inside an eps-ball around zero
 * (if absolute "error" is below eps)
 *
 * @param {v} input value to check
 * @returns {bool} whether or not value is inside eps-ball
 */
export function withinEps(v) {
  return Math.abs(v) < eps;
}

/**
 * returns true if v1 and v2 fit inside an (eps/2 * (|v1| + |v2|))-ball
 * of one another.
 *
 * @param {v1} input v1
 * @param {v2} input v2
 * @returns {bool} whether v1 and v2 are "relative-within" eps of one another
 */
export function withinEpsRel(v1, v2) {
  let dv = Math.abs(v1 - v2);
  let diameter = eps * (Math.abs(v1) + Math.abs(v2));
  return dv < diameter;
}

/**
 * returns the two roots of the quadratic system a x^2 + b x + c = 0
 * this assumes real solutions exist.
 *
 * This uses a naive formula to evaluate the discriminant, and
 * a slightly less naive formula that avoids cancellation
 * between b^2 and discriminant
 *
 * In other words, expect instability if discriminant is near 0.
 *
 * @param {a} input a
 * @param {b} input b
 * @param {c} input c
 * @return {Object} object o such that o.root1 and o.root2 are both roots of quadratic
 */
export function quadratic(a, b, c) {
  // numerics is hard.
  if (a === 0)
    return { root1: -c/b, root2: -c/b };
  if (b === 0 && c === 0) {
    return { root1: 0, root2: 0 };
  }
  var discriminant = b * b - 4 * a * c;
  if (discriminant < 0 && withinEps(discriminant)) {
    discriminant = 0;
  }
  if (discriminant === 0) {
    return { root1: -b/(2*a), root2: -b/(2*a) };
  }
  var d = Math.sqrt(discriminant);

  if (b >= 0) {
    return { root1: (-b - d) / (2 * a), root2: (2 * c) / (-b - d) };
  } else {
    return { root1: (2 * c) / (-b + d), root2: (-b + d) / (2 * a) };
  }
}

/**
 * finds one root of f, given a bracket in [lo, up]: 
 *   either f(lo) < 0 and f(hi) > 0 or f(lo) > 0 and f(hi) < 0
 *
 * @param {f} input function to evaluate, Number -> Number
 * @param {lo} input lower bound of bracket
 * @param {up} input upper bound of bracket
 * @returns {Object} returns midpoint of bracketing interval with
 * length < eps (o.v) and the value of the function evaluated there
 * (o.fV)
 */
export function findRoot(f, lo, up) {
  if (up <= lo)
    throw new Error("Expected up > lo.");
  var fLo = f(lo), fUp = f(up);
  if (fLo < 0 && fUp < 0)
    throw new Error("Expected either f(lo) or f(up) to be positive.");
  if (fLo > 0 && fUp > 0)
    throw new Error("Expected either f(lo) or f(up) to be negative.");
  var mode = fLo > 0;
  var d = up - lo;
  var mid, fMid;
  while (d > eps) {
    mid = (lo + up) / 2;
    fMid = f(mid);
    if (fMid === 0)
      return mid;
    if ((fMid > 0) ^ mode)
      up = mid;
    else
      lo = mid;
    d = up - lo;
  }
  return { v: mid, fV: fMid };
}

/**
 * finds extremum of function using golden section search.
 *
 * @param {f} input function to evaluate, Number -> Number
 * @param {lo} input lower bound of bracket
 * @param {mid} input some point inside the bracket
 * @param {up} input upper bound of bracket
 * @returns {Object} 
 *   - o.v: midpoint of extremum bracket with width < eps; 
 *   - o.fV: function value at extremum; 
 *   - o.type: "minimum" or "maximum"
 */
export function findExtremum(f, lo, mid, up) {
  if (up <= mid)
    throw new Error("Expected up > mid.");
  if (mid <= lo)
    throw new Error("Expected mid > lo.");
  var fLo = f(lo), fUp = f(up), fMid = f(mid), mode;
  if (fMid < fLo && fMid < fUp) {
    mode = 1; // "minimum"
  } else if (fMid > fLo && fMid > fUp) {
    mode = 0; // "maximum"
  } else {
    throw new Error("Expected configuration to be either minimum or maximum.");
  }
  var d = up - lo;
  var phi = 0.618;
  while (d > eps) {
    var longLeft = (mid - lo) > (up - mid);
    var newMid, fNewMid;
    if (longLeft) {
      newMid = phi * mid + (1 - phi) * lo;
    } else {
      newMid = phi * mid + (1 - phi) * up;
    }
    fNewMid = f(newMid);
    switch ((!longLeft) * 2 + ((fNewMid >= fMid) ^ (!mode))) {
    case 0:
      up = mid;         // case 0
      fUp = fMid;
      mid = newMid;
      fMid = fNewMid;
      break;
    case 1:
      lo = newMid;      // case 1
      fLo = fNewMid;
      break;
    case 2:
      lo = mid;         // case 2
      fLo = fMid;
      mid = newMid;
      fMid = fNewMid;
      break;
    case 3:
      up = mid;         // case 3
      fUp = fMid;
      break;
    }
    // if (mode === 1) { // minimum
    //     if (longLeft) {
    //         if (fNewMid < fMid) { /* case 0 */ } else { /* case 1 */ }
    //     } else {
    //         if (fNewMid < fMid) { /* case 2 */ } else { /* case 3 */ }
    //     }
    // } else { // maximum
    //     if (longLeft) {
    //         if (fNewMid < fMid) { /* case 1 */ } else { /* case 0 */ }
    //     } else {
    //         if (fNewMid < fMid) { /* case 3 */ } else { /* case 2 */ }
    //     }
    // }
  }
  return {
    v: mid,
    fV: fMid,
    type: ["maximum", "minimum"][mode]
  };
}

/**
 * convert degrees to radians
 *
 * @param {d} input value in degrees
 * @returns {Number} value in radians
 */
export function radians(d) {
  return d * (Math.PI/180);
}

/**
 * convert radians to degrees
 *
 * @param {r} input value in radians
 * @returns {Number} value in degrees
 */
export function degrees(r) {
  return r / (Math.PI/180);
}

/**
 * returns (n choose k), the binomial coefficients with indices n and k
 *   n!/(k! (n - k)!)
 *
 * @param {n} input n
 * @param {k} input k
 * @returns {Number} n!/(k! (n - k)!)
 */
export function choose(n, k) {
  k = Math.min(k, n-k);
  var result = 1;
  var v = n;
  for (var i=1; i<=k; ++i) {
    result *= v / i;
    v -= 1;
  }
  return result;
}

/**
 * returns n! = 1 * 2 * ... * n
 *
 * @param {n} input n
 * @returns {Number} n!
 */
export function fact(n) {
  var result = 1;
  for (var i=1; i<=n; ++i)
    result *= i;
  return result;
}
