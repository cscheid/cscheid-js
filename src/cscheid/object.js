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

export function clone(obj)
{
  if (!isObject(obj)) return obj;
  return Array.isArray(obj) ? obj.slice() : extend({}, obj);
}

//////////////////////////////////////////////////////////////////////////////
// All I wanted was toArray; I got 50% of underscore instead, and 
// it is all so very ugly.

let ObjProto = Object.prototype;
let ArrayProto = Array.prototype;
let toString = ObjProto.toString;
let slice = ArrayProto.slice;
let push = ArrayProto.push;
let identity = function(v) { return v; };

let shallowProperty = function(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
};
let MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
let getLength = shallowProperty('length');
let isArrayLike = function(collection) {
  var length = getLength(collection);
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

function builtinIteratee(value, context) {
  return cb(value, context, Infinity);
};

function cb(value, context, argCount) {
  if (value == null) return identity;
  if (isFunction(value)) return optimizeCb(value, context, argCount);
  if (isObject(value) && !Array.isArray(value)) return _.matcher(value);
  return _.property(value);
};

var optimizeCb = function(func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
  case 1: return function(value) {
    return func.call(context, value);
  };
    // The 2-argument case is omitted because we’re not using it.
  case 3: return function(value, index, collection) {
    return func.call(context, value, index, collection);
  };
  case 4: return function(accumulator, value, index, collection) {
    return func.call(context, accumulator, value, index, collection);
  };
  }
  return function() {
    return func.apply(context, arguments);
  };
};

export function keys(obj) {
  if (!isObject(obj)) {
    return [];
  }
  return Object.keys(obj);
}

export function values(obj) {
  var ks = keys(obj);
  var length = ks.length;
  var values = Array(length);
  for (var i = 0; i < length; i++) {
    values[i] = obj[ks[i]];
  }
  return values;
};

export function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var keys = !isArrayLike(obj) && keys(obj),
      length = (keys || obj).length,
      results = Array(length);
  for (var index = 0; index < length; index++) {
    var currentKey = keys ? keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
};

export function isArguments(obj) { return toString.call(obj) === '[object Arguments]'; }
export function isFunction(obj)  { return toString.call(obj) === '[object Function]'; }
export function isString(obj)    { return toString.call(obj) === '[object String]'; }
export function isNumber(obj)    { return toString.call(obj) === '[object Number]'; }
export function isDate(obj)      { return toString.call(obj) === '[object Date]'; }
export function isRegExp(obj)    { return toString.call(obj) === '[object RegExp]'; }
export function isError(obj)     { return toString.call(obj) === '[object Error]'; }
export function isSymbol(obj)    { return toString.call(obj) === '[object Symbol]'; }
export function isMap(obj)       { return toString.call(obj) === '[object Map]'; }
export function isWeakMap(obj)   { return toString.call(obj) === '[object WeakMap]'; }
export function isSet(obj)       { return toString.call(obj) === '[object Set]'; }
export function isWeakSet(obj)   { return toString.call(obj) === '[object WeakSet]'; }

export function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};

var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
/**
 * Safely create a real, live array from anything iterable.
 *
 * @param {obj} input obj
 * @returns {Array} an array containing the values in obj.
 */
export function toArray(obj)
{
  if (!obj) {
    return [];
  }
  if (Array.isArray(obj)) {
    return obj.slice();
  }
  if (isString(obj)) {
    // Keep surrogate pair characters together
    return obj.match(reStrSymbol);
  }
  if (isArrayLike(obj)) {
    return map(obj, identity);
  }
  return values(obj);
}
