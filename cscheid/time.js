import * as cscheid from "../cscheid.js";

var epoch = Date.now();

export function elapsed() {
  return (Date.now() - epoch) / 1000;
};
