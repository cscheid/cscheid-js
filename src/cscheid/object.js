import * as cscheid from "../cscheid.js";

//////////////////////////////////////////////////////////////////////////////
// bits of underscore that are generally useful go here
//
// from https://github.com/jashkenas/underscore/blob/master/underscore.js
//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors

var createAssigner = function(keysFunc, defaults) {
  return function(obj) {
    var length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  };
};

export function allKeys(obj) {
  if (!isObject(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
};

export let extend = createAssigner(allKeys);
export let defaults = createAssigner(allKeys, true);

export function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};

export function clone(obj)
{
  if (!isObject(obj)) return obj;
  return Array.isArray(obj) ? obj.slice() : extend({}, obj);
}
