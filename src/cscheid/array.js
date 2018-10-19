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
