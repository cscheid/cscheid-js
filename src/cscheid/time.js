/** @module cscheid/time */

// import * as cscheid from "../cscheid.js";

var epoch = Date.now();

/**
 * Returns wall-clock time in seconds since beginning of program
 * @returns {number} number of seconds since program started 
 */
export function elapsed() {
  return (Date.now() - epoch) / 1000;
}
