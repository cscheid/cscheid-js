/**
 * returns the concatenation of the arrays. Eg concat([[1,2,3],[4]]) => [1,2,3,4]
 * This is _not_ "flatten": it won't work on nested structures.
 *
 * @param {lst} input the array of arrays
 * @returns {Array} the concatenated
 **/
export function concat(lst)
{
  return [].concat.apply([], lst);
}

// This assumes lst is numeric.
export function prefixSum(lst)
{
  var result = new Float64Array(lst.length + 1);
  for (var i=1; i<=lst.length; ++i)
    result[i] = result[i-1] + lst[i-1];
  return result;
}

// This assumes lst is sorted and numeric.
// returns the least index such that lst[index] > target
// this returns an invalid index if max(lst) <= target or min(lst) > target
export function lowerBound(lst, target)
{
  var lo = 0, hi = lst.length-1;
  var vLo = lst[lo], vHi = lst[hi];
  while (hi - lo > 1) {
    var mid = ~~((lo + hi) / 2);
    var vMid = lst[mid];
    if (vMid === target) {
      // this is the only difference between lowerBound and upperBound
      lo = mid;
      vLo = vMid;
    } else if (vMid > target) {
      hi = mid;
      vHi = vMid;
    } else if (vMid < target) {
      lo = mid;
      vLo = vMid;
    }
  }
  if (target >= lst[lst.length - 1])
    return lst.length;
  if (target < lst[0])
    return 0;
  return hi;
}

// This assumes lst is sorted and numeric.
// returns the greatest index such that lst[index] < target
// this returns an invalid index if max(lst) < target or min(lst) >= target
export function upperBound(lst, target)
{
  var lo = 0, hi = lst.length-1;
  var vLo = lst[lo], vHi = lst[hi];
  while (hi - lo > 1) {
    var mid = ~~((lo + hi) / 2);
    var vMid = lst[mid];
    if (vMid === target) {
      // this is the only difference between lowerBound and upperBound
      hi = mid;
      vHi = vMid;
    } else if (vMid > target) {
      hi = mid;
      vHi = vMid;
    } else if (vMid < target) {
      lo = mid;
      vLo = vMid;
    }
  }
  if (target > lst[lst.length - 1])
    return lst.length-1;
  if (target <= lst[0])
    return 0;
  return lo;
}
