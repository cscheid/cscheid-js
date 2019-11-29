import * as cscheid from "../cscheid.js";

//////////////////////////////////////////////////////////////////////////////
// Grand Tour

/* This is a grand tour implementation using the method
   of walking along a geodesic on the space of all rotations
   via Givens rotations

   To show a reduced-dimensionality plot, pick the first k
   coordinates.
*/

export function grandTour(d)
{
  var givensRots = [];
  // Note! makeGivensRot functions mutate the vector.
  function makeGivensRot(i, j, speed) {
    return function(v, t) {
      let angle = speed * t;
      let v1 = v[i], v2 = v[j];
      let c = Math.cos(angle), s = Math.sin(angle);
      let o1 = c * v1 - s * v2,
          o2 = s * v1 + c * v2;
      v[i] = o1;
      v[j] = o2;
    };
  }
  for (var i=0; i<d-1; ++i) {
    for (var j=i+1; j<d; ++j) {
      givensRots.push(makeGivensRot(i, j, Math.random()-0.5));
    }
  }
  
  return function(v, t) {
    for (var i=0; i<givensRots.length; ++i) {
      givensRots[i](v, t);
    }
    return v;
  };
}

//////////////////////////////////////////////////////////////////////////////
// Classical MDS
//
// this expects squared distances or inner products!
export function CMDS(m)
{
  let SVD = cscheid.linalg.svd;
  let t = cscheid.linalg.transpose;
  let sz = m.length;
  let subtractRowAvg = cscheid.linalg.centerColumns;
  // function subtractRowAvg(m) {
  //   let avg = new Float64Array(sz);
  //   m.forEach(function(r) {
  //     avg = cscheid.linalg.add(avg, r);
  //   });
  //   avg = cscheid.linalg.scale(avg, 1/sz);
  //   return m.map(function(r) { return cscheid.linalg.sub(r, avg); });
  // }
  m = t(subtractRowAvg(m));
  m = t(subtractRowAvg(m));
  m = m.map(function(r) { return cscheid.linalg.scale(r, -1/2); });
  let result = SVD(m);
  return t(t(result.u).map(function(r, i) {
    return cscheid.linalg.scale(r, Math.sqrt(result.q[i]));
  }));
}
