import * as cscheid from "../cscheid.js";
import * as svm from "./classify/svm.js";

export function svmTrain(data, lambda, learningRate)
{
  return svm.svmTrain(data, lambda, learningRate);
}

export function nearestNeighbors(data, queryPoint, k)
{
  var heap = cscheid.dataStructures.binaryHeap();
  data.forEach((currentPoint, i) => {
    let currentDistance = cscheid.linalg.distance2(currentPoint.point, queryPoint.point);
    heap.add(i, currentDistance);
    if (heap.size() > k) {
      heap.pop();
    }
  });

  var result = [];
  while (heap.size()) {
    result.push({ d: heap.maxPriority(), i: heap.maxPoint() });
    heap.pop();
  }
  return result;
}

// this function can be useful when making many kNN queries against
// the same set of points.
//
// quadtree here is d3's quadtree, or something with the same API
export function nearestNeighbors2D(quadtree, queryPoint, k)
{
  var heap = cscheid.dataStructures.binaryHeap();

  quadtree.visit((node, x0, y0, x1, y1) => {
    // we only early out when heap is full
    var earlyOut = false;
    
    if (heap.size() === k) {
      var distToNodeX, distToNodeY;
      if (x0 > queryPoint.point[0]) {
        distToNodeX = x0;
      } else if (x1 < queryPoint.point[0]) {
        distToNodeX = x1;
      } else
        distToNodeX = queryPoint.point[0];
      if (y0 > queryPoint.point[1]) {
        distToNodeY = y0;
      } else if (y1 < queryPoint.point[1]) {
        distToNodeY = y1;
      } else
        distToNodeY = queryPoint.point[1];
      
      // all distances to points inside will be at least distToNode
      var distToNode = cscheid.linalg.distance2([distToNodeX, distToNodeY], queryPoint.point);
      earlyOut = distToNode >= heap.maxPriority();
    }

    // so, if distToNode is no less than the current max priority so far,
    // then adding all of these points does nothing. So we're safe skipping
    // all of this node.
    if (earlyOut)
      return true;

    if (!node.length) {
      do {
        let currentDistance = cscheid.linalg.distance2(node.data.point, queryPoint.point);
        heap.add(node.data.i, currentDistance);
        if (heap.size() > k) {
          heap.pop();
        }
        node = node.next;
      } while (node);
    }
    return false;
  });

  var result = [];
  while (heap.size()) {
    result.push({ d: heap.maxPriority(), i: heap.maxPoint() });
    heap.pop();
  }
  return result;
}

export function classifyFromNNs(nns)
{
  let histogram = {};
  nns.forEach(d => {
    let count = histogram[d.i] || { i: d.i, count: 0 };
    count.count++;
    histogram[d.i] = count;
  });
  return d3.values(histogram).sort((a, b) => b.count - a.count)[0].i;
}
