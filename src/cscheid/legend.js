/** @module cscheid/legend */

/**
 * A mostly-minimal d3 legend library
 *
 * It's probably easy to adapt this do be entirely self-contained,
 * but right now this depends on plots.js:create
 */

/*global d3*/
import * as cscheid from "../cscheid.js";

// TODO symbolSizeLegend

// export function symbolSizeLegend(opts)
// {
//   var scale = opts.scale;
//   var extent = opts.extent;
//   var parent = opts.plot.addGroupToLayer({});

//   var legendDomain = scale.domain();

//   var posScale = d3.scaleLinear()
//       .domain([legendDomain[0],
//                legendDomain[legendDomain.length-1]])
//       .range(extent);

//   var group = parent.append("g");
//   var axisGroup, titleGroup;
//   var legendObjects;

//   if (opts.axis === "right") {
//     legendObjects = opts.plot.addPaths(legendDomain, {
//     });
//   } else {
//     throw new Error("unimplemented...");
//   }
// } 

export function symbolTypeLegend(opts)
{
  var scale  = opts.scale;
  var size   = opts.size || 64;
  var extent = opts.extent;
  var parent = opts.plot.addGroupToLayer({});
  
  var legendDomain = scale.domain();
  var posScale = d3.scaleLinear()
      .domain([0, legendDomain.length - 1])
      .range(extent);

  var group = parent.append("g");
  var axisGroup, titleGroup;
  var legendObjects;
  
  // FIXME wtf is this?
  function setScale(sel) {
    sel.attr("fill", scale);
  }

  if (opts.axis === "right") {
    legendObjects = opts.plot.addPaths(legendDomain, {
      group: group,
      d: d => d3.symbol()
        .size(size)
        .type(scale(d))(),
      transform: (d, i) => cscheid.svg.translate(0, posScale(i)),
      stroke: "black",
      fill: () => d3.lab(70, 0, 0)
    });
    opts.plot.addLines(legendDomain, {
      group: group,
      custom: sel =>
        sel.attr("x1", 10)
        .attr("x2", 15)
        .attr("y1", (d, i) => posScale(i))
        .attr("y2", (d, i) => posScale(i))
        .attr("stroke", "black")
    });
    opts.plot.addText(legendDomain, {
      group: group,
      custom: sel =>
        sel.attr("x", 20)
        .attr("y", (d, i) => posScale(i))
        .text(d => d)
        .attr("dominant-baseline", "middle")
        .attr("font-size", "10")
    });
    if (opts.title) {
      titleGroup = group.append("g");
      titleGroup
        .append("text")
        .text(opts.title)
        .attr("x", -15)
        .attr("y", d3.mean(posScale.range()))
        .call(cscheid.css.centerVerticalText);
    }
  } else {
    throw new Error("Unimplemented...");
  }

  return {
    mainGroup: group,
    axisGroup: axisGroup,
    legendObjects: legendObjects,
    titleGroup: titleGroup,
    update: function(sel) { setScale(sel); }
  };
}

export function colorLegend(opts)
{
  var axisChoices = {
    bottom: d3.axisBottom,
    top:    d3.axisTop,
    left:   d3.axisLeft,
    right:  d3.axisRight
  };
  var scale      = opts.scale;
  var axis       = axisChoices[opts.axis || "bottom"];
  var extent     = opts.extent;
  var parent     = opts.plot.addGroupToLayer({});
  var title      = opts.title;
  var resolution = opts.resolution || 1;
  var size       = opts.size || 20;
  var tickFormat = opts.tickFormat || d3.format(".0s");

  var colorScaleDomainBounds = [scale.domain()[0], scale.domain()[scale.domain().length - 1]];
  var legendScale = d3.scaleLinear()
      .domain(colorScaleDomainBounds)
      .range(extent);
  var nValues = ~~Math.abs((extent[1] - extent[0]) / resolution);
  var legendValues = d3.range(nValues)
      .map(d3.scaleLinear()
           .domain([0, nValues - 1])
           .range(colorScaleDomainBounds));

  var group = parent.append("g");
  var axisObj;
  var axisGroup;
  var titleGroup;
  var legendObjects;

  // FIXME wtf is this?
  function setScale(sel) {
    sel.attr("fill", scale);
  }

  if (opts.axis === "left") {
    legendObjects = group.append("g")
      .selectAll("rect")
      .data(legendValues)
      .enter()
      .append("rect")
      .attr("width", size)
      .attr("height", ~~(Math.abs(legendScale(legendValues[1]) - legendScale(legendValues[0])) + 1))
      .attr("x", 0)
      .attr("y", legendScale)
      .call(setScale);
    axisObj = axis(legendScale).tickFormat(tickFormat);
    axisGroup = group.append("g")
      .call(axisObj);
    if (title) {
      titleGroup = group.append("g");
      titleGroup
        .append("text")
        .text(title)
        .attr("x", -25)
        .attr("y", d3.mean(legendScale.range()))
        .call(cscheid.css.centerVerticalText);
    }
  } else {
    throw new Error("unimplemented..");
  }

  return {
    mainGroup: group,
    axisObject: axisObj,
    axisGroup: axisGroup,
    legendObjects: legendObjects,
    titleGroup: titleGroup,
    update: function(sel) { setScale(sel); }
  };
}
