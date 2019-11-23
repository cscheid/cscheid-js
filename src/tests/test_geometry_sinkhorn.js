// tests for cscheid/geometry/sinkhorn.js

import * as cscheid from "../cscheid.js";
import * as utils from "./utils.js";

export let __name__ = "geometry.sinkhorn";
export function runTests()
{
  testGeometrySinkhorn();
}

//////////////////////////////////////////////////////////////////////////////

function testGeometrySinkhorn()
{
  cscheid.debug.assert(
    cscheid.math.withinEpsRel(
      cscheid.geometry.sinkhorn.dualSinkhornDivergence(
        [1,0,0,0,0,0,0,0],
        [0,0,1,0,0,0,0,0],
        cscheid.geometry.gridDistance(1, 8),
        5).d, 2));
}
