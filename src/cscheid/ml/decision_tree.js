import * as cscheid from "../../cscheid.js";

function leafNode(label)
{
  return {
    label: label,
    classify: function(instance) {
      return this.label;
    }
  };
}

function internalNode(featureName, featureValue, treeIfFalse, treeIfTrue)
{
  return {
    treeIfFalse: treeIfFalse,
    treeIfTrue: treeIfTrue,
    condition: function(instance) {
      return instance[featureName] === featureValue;
    },
    classify: function(instance) {
      if (this.condition(instance)) {
        return this.treeIfTrue.classify(instance);
      } else {
        return this.treeIfFalse.classify(instance);
      }
    }
  };
}

function majorityVote(samples)
{
  let h = cscheid.array.histogram(samples, (sample) => sample.label);
  return cscheid.map.argmax(h);
}

function majorityVoteCount(samples)
{
  let h = cscheid.array.histogram(samples, (sample) => sample.label);
  return cscheid.map.max(h);
}

// decision tree training for datasets with purely categorical features.
function simpleDecisionTree()
{
  function internalTrain(labeledSamples, remainingFeatureValuePairs, remainingDepth) {
    let h = cscheid.array.histogram(labeledSamples, (sample) => sample.label);
    if (h.size === 0) {
      return leafNode(undefined);
    } else if (h.size === 1 ||
               remainingFeatureValuePairs.length === 0 ||
               remainingDepth === 0) {
      let targetLabel = cscheid.map.argmax(h); // avoid recomputing histogram
      return leafNode(targetLabel);
    }
    let bestScore = 0;
    let bestPair, bestNo, bestYes;
    remainingFeatureValuePairs.forEach((fName, fValue) => {
      let noList = [], yesList = [];
      labeledSamples.forEach(sample => {
        let v = sample.features[fName];
        if (v !== fValue) {
          noList.push(sample);
        } else {
          yesList.push(sample);
        }
      });
      let score = majorityVoteCount(noList) + majorityVoteCount(yesList);
      if (score > bestScore) {
        bestScore = score;
        bestPair = [fName, fValue];
        bestNo = noList;
        bestYes = yesList;
      }
    });
    let nextFeatures = remainingFeatureValuePairs.filter(
      (kv => (kv[0] !== bestPair[0] || kv[1] !== bestPair[1])));
    let leftNode = internalTrain(bestNo, nextFeatures, remainingDepth - 1);
    let rightNode = internalTrain(bestYes, nextFeatures, remainingDepth - 1);
    return internalNode(bestPair[0], bestPair[1], leftNode, rightNode);
  }
  
  return {
    train: function(dataset, maxDepth) {
      // FIXME this should check the metadata for compatibility.
      return internalTrain(dataset.trainingSet,
                           dataset.featureValuePairs(),
                           maxDepth);
    }
  };
}
