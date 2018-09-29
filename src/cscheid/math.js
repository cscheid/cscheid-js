import * as cscheid from "../cscheid.js";

export var eps = 1e-6;

export function withEps(eps, f) {
  var oldEps = eps;
  try {
    eps = eps;
    f();
  } finally {
    eps = oldEps;
  }
}

export function withinEps(v) {
  return Math.abs(v) < eps;
}
   
// numerics sucks.
export function quadratic(a, b, c) {
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

// bisection search for root-finding
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
}

export function radians(d) {
  return d * (Math.PI/180);
}
    
export function degrees(r) {
  return r / (Math.PI/180);
}

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

export function fact(n) {
  var result = 1;
  for (var i=1; i<=n; ++i)
    result *= i;
  return result;
}
