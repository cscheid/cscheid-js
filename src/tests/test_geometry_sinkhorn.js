// tests for cscheid/geometry/sinkhorn.js
import * as cscheid from "../cscheid.js";

export let __name__ = "geometry.sinkhorn";
export function runTests()
{
  testGeometrySinkhorn();
}

//////////////////////////////////////////////////////////////////////////////

function testGeometrySinkhorn()
{
  let s1 = [0,1,0,1,0,0,0,0];
  let t1 = cscheid.geometry.sinkhorn.dualSinkhornDivergence(
    s1,
    [1,0,0,0,1,0,0,0],
    cscheid.geometry.gridDistance(1, 8),
    8);
  cscheid.debug.assert(
    cscheid.math.withinEpsRel(
      t1.d, 2));

  // just run this for now, eventually I want to check
  // the results
  for (var i = 0; i <= 16; ++i) {
    cscheid.geometry.sinkhorn.renderPartialImageTransport(
      t1.p, s1, 1, 8, i / 16);
  }
}
