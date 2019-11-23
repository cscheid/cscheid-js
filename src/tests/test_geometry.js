// tests for cscheid/approximation.js

import * as testGeometrySinkhorn from "./test_geometry_sinkhorn.js";
import * as utils from "./utils.js";

export let __name__ = "geometry";
export function runTests()
{
  utils.testModules([
    testGeometrySinkhorn
  ]);
}
