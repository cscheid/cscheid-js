/** @module cscheid/map */

// Utility functions for ES6 maps

/**
 * Returns max and argmax over the map
 * @param {Map} map: the ES6 map
 * @param {(function|undefined)} by: the function to compare against, or identity if undefined;
 * @returns {Object} result.key: the max; result.value: the argmax
 */
export function maxArgmax(map, by)
{
  let fun = by ? by : (d => d);
  let maxV = -Number.MAX_VALUE;
  let maxK;
  map.forEach((v, k) => {
    v = fun(v);
    if (v > maxV) {
      maxV = v;
      maxK = k;
    }
  });
  return {
    key: maxK,
    value: maxV
  };
}

/**
 * Returns the argmax over the map
 * @param {Map} map: the ES6 map
 * @param {(function|undefined)} by: the function to compare against, or identity if undefined;
 * @returns {Object} one key corresponding to the max value
 */
export function argmax(map, by)
{
  return maxArgmax(map, by).key;
}

/**
 * Returns the max over the map
 * @param {Map} map: the ES6 map
 * @param {(function|undefined)} by: the function to compare against, or identity if undefined;
 * @returns {Object} the max value
 */
export function max(map, by)
{
  return maxArgmax(map, by).value;
}
