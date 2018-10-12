/**
 * A minimal d3 legend library
 */

import * as cscheid from "../cscheid.js";

export function colorLegend(options)
{
  var axisChoices = {
    bottom: d3.axisBottom,
    top: d3.axisTop,
    left: d3.axisLeft,
    right: d3.axisRight
  };
  var scale      = options.scale;
  var axis       = axisChoices[options.axis || "bottom"];
  var extent     = options.extent;
  var parent     = options.element;
  var resolution = options.resolution || 1;
  var size       = options.size || 20;
  var tickFormat = options.tickFormat || d3.format(".0s");

  var colorScaleDomainBounds = [scale.domain()[0], scale.domain()[scale.domain().length - 1]];
  var legendScale = d3.scaleLinear()
      .domain(colorScaleDomainBounds)
      .range(extent);
  var nValues = ~~Math.abs((extent[1] - extent[0]) / resolution);
  var legendValues = d3.range(nValues)
      .map(d3.scaleLinear().domain([0, nValues-1]).range(colorScaleDomainBounds));

  var group = parent.append("g");
  var axisObj;
  var axisGroup;
  var legendObjects;

  function setScale(sel) {
    sel.attr("fill", scale);
  }

  if (options.axis === "left") {
    legendObjects = group.append("g")
      .selectAll("rect")
      .data(legendValues)
      .enter()
      .append("rect")
      .attr("width", size)
      .attr("height", ~~(Math.abs(legendScale(legendValues[1]) - legendScale(legendValues[0]))+1))
      .attr("x", 0)
      .attr("y", legendScale)
      .call(setScale);
    axisObj = axis(legendScale).tickFormat(tickFormat);
    axisGroup = group.append("g")
      .call(axisObj);
  } else {
    throw new Error("unimplemented..");
  }

  return {
    mainGroup: group,
    axisObject: axisObj,
    axisGroup: axisGroup,
    legendObjects: legendObjects,
    update: function(sel) { setScale(sel); }
  };
}
