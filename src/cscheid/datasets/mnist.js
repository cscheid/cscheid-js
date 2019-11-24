import * as cscheid from "../../cscheid.js";

export function load(urlPath) {
  urlPath = urlPath || "/datasets/mnist/";

  // http://yann.lecun.com/exdb/mnist/
  // we fetch everything at once :shrug:
  let trainImages = d3.buffer(urlPath + "/train-images-idx3-ubyte");
  let trainLabels = d3.buffer(urlPath + "/train-labels-idx1-ubyte");
  let testImages = d3.buffer(urlPath + "/t10k-images-idx3-ubyte");
  let testLabels = d3.buffer(urlPath + "/t10k-labels-idx1-ubyte");
  let resultPromise = Promise.all(
    [trainImages, trainLabels, testImages, testLabels])
      .then(function(values) {
        let trIBuf = values[0]; // trainImages;
        let trLBuf = values[1]; // trainlabels;
        let teIBuf = values[2]; // testImages;
        let teLBuf = values[3]; // testLabels;
        let trainLView = new DataView(trLBuf);
        let testLView  = new DataView(teLBuf);
        return {
          getTrainingPoint: function(ix) {
            return {
              data: new Uint8Array(trIBuf, (ix * 28 * 28) + 16, 28 * 28),
              label: trainLView.getInt8(ix + 8)
            };
          },
          getTestPoint: function(ix) {
            return {
              data: new Uint8Array(teIBuf, (ix * 28 * 28) + 16, 28 * 28),
              label: trainLView.getInt8(ix + 8)
            };
          },
        };
        return values;
      });
  return resultPromise;
}
