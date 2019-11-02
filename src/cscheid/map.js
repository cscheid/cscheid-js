/** Utility functions for ES6 maps */

export function maxArgmax(map, by)
{
  let fun = by ? by : (d => d);
  let maxV = -Number.MAX_VALUE;
  let maxK;
  map.forEach((v, k) => {
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

export function argmax(map, by)
{
  return maxArgmax(map, by).key;
}

export function max(map, by)
{
  return maxArgmax(map, by).value;
}
