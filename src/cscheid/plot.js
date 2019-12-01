/** @module cscheid/plot */

/*global d3,_ */

import * as cscheid from "../cscheid.js";
import * as math from "./math.js";
import * as blas from "./blas.js";

//////////////////////////////////////////////////////////////////////////////
// FIXME: There are two different plotting libraries in this file,
// because I wrote them separately at some point in time. Consolidate this.

//////////////////////////////////////////////////////////////////////////////

export function surface(opts)
{
  var width   = opts.width || 600;
  var height  = opts.height || 300;
  var axes    = opts.axes     === undefined ? true : opts.axis;
  var margin  = opts.margin   === undefined ? 10 : opts.margin;
  var element = opts.element || cscheid.debug.die("element parameter is required");

  var svg = element.append("svg")
      .attr("width", width)
      .attr("height", height);

  var xScale = opts.xScale || d3.scaleLinear().domain([-1.1, 1.1]);
  xScale.range([margin, width-margin]);
  var yScale = opts.yScale || d3.scaleLinear().domain([-0.55, 0.55]);
  yScale.range([height-margin, margin]);

  var axisGroup = svg.append("g");
  var xAxis = d3.axisBottom(xScale);
  if (opts.xTicks)
    xAxis.ticks(opts.xTicks);
  var yAxis = d3.axisLeft(yScale);
  if (opts.yTicks)
    yAxis.ticks(opts.yTicks);
  var xAxisGroup = axisGroup
      .append("g")
      .attr("transform", cscheid.svg.translate(0, yScale(0)));
  var yAxisGroup = axisGroup
      .append("g")
      .attr("transform", cscheid.svg.translate(xScale(0), 0));
  if (axes) {
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);
  }

  var wrappedPassThroughMethods = {
    append: true,
    select: true,
    selectAll: true,
    each: true,
    attr: true,
    style: true,
    transition: true,
    enter: true,
    exit: true,
    data: true,
    filter: true,
    remove: true,
    delay: true,
    duration: true,
    text: true,
    on: true
  };
  // wrappedSelection is _NOT EXACTLY_ a d3 selection, but it mostly looks like one.
  // Be aware of this..
  function wrappedSelection(sel, fixedKeyMethods, functionKeyMethods) {
    var wrapperFunction;
    fixedKeyMethods = fixedKeyMethods || {};
    functionKeyMethods = functionKeyMethods || {};
    var result = {
      // don't wrap call, since it doesn't return a selection
      call: function() {
        var callback = arguments[0];
        arguments[0] = this;
        callback.apply(null, arguments);
        return this;
      },
      callReturn: function() {
        var callback = arguments[0];
        arguments[0] = this;
        return callback.apply(null, arguments);
      },
      _select: function() {
        var innerSelResult = d3.select.apply(null, arguments);
        return wrappedSelection(innerSelResult, fixedKeyMethods, functionKeyMethods);
      }
    }, methodName;
    result.__sel__ = sel;

    // set defaults
    for (methodName in wrappedPassThroughMethods) {
      // skip the ones we're going to override
      if (fixedKeyMethods[methodName] !== undefined)
        continue;
      if (functionKeyMethods[methodName] !== undefined)
        continue;

      // force a closure to capture in-loop variables
      result[methodName] = (methodName => function() {
        var innerSelResult = sel[methodName].apply(sel, arguments);
        return wrappedSelection(innerSelResult, fixedKeyMethods, functionKeyMethods);
      })(methodName);
    }

    // now override the ones with explicitly given wrappers
    for (methodName in fixedKeyMethods) {
      wrapperFunction = fixedKeyMethods[methodName];

      // force a closure to capture in-loop variables
      result[methodName] = ((methodName, wrapperFunction) => function(key, value) {
        var wrappedValue;
        if (_.isFunction(value)) {
          wrappedValue = function() {
            var result = value.apply(this, arguments);
            return wrapperFunction(key, result);
          };
        } else if (value === undefined) {
          wrappedValue = undefined;
        } else {
          wrappedValue = wrapperFunction(key, value);
        }
        var innerSelResult = sel[methodName].call(sel, key, wrappedValue);
        return wrappedSelection(innerSelResult, fixedKeyMethods, functionKeyMethods);
      })(methodName, wrapperFunction);
    }

    for (methodName in functionKeyMethods) {
      wrapperFunction = functionKeyMethods[methodName];

      // force a closure to capture in-loop variables
      result[methodName] = ((methodName, wrapperFunction) => function(key) {
        var wrappedKey;
        if (_.isFunction(key)) {
          wrappedKey = function() {
            var result = key.apply(this, arguments);
            return wrapperFunction(key, result);
          };
        } else if (key === undefined) {
          wrappedKey = undefined;
        } else {
          wrappedKey = wrapperFunction(key);
        }
        var innerSelResult = sel[methodName].call(sel, wrappedKey);
        return wrappedSelection(innerSelResult, fixedKeyMethods, functionKeyMethods);
      })(methodName, wrapperFunction);
    }

    return result;
  }

  var xScaledKeys = { cx: true, x1: true, x: true, x2: true };
  var yScaledKeys = { cy: true, y1: true, y: true, y2: true };

  var wrappedSvg = wrappedSelection(svg, {
    attr: function(key, value) {
      if (xScaledKeys[key])
        return xScale(value);
      if (yScaledKeys[key])
        return yScale(value);
      // TODO: parse a "d" attribute for a path as well.
      return value;
    }
  });

  var surface = {
    svg: svg,
    xScale: xScale,
    yScale: yScale,
    addFunction: function(f, steps) {
      if (!_.isArray(f))
        f = [f];
      steps = steps || 100;
      var s = d3.scaleLinear().domain([0, steps]).range(xScale.domain());
      var data = d3.range(steps+1);

      return svg.append("g").selectAll("path")
        .data(f)
        .enter().append("path")
        .attr("d", f => {
          var lineGenerator = d3.line()
              .x(d => xScale(s(d)))
              .y(d => yScale(f(s(d))));
          return lineGenerator(data);
        });
    },
    addText: function(text, x, y) {
      return svg.append("text").text(text)
        .attr("class", "annotation")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("x", xScale(x))
        .attr("y", yScale(y));
    }
  };

  wrappedSvg.surface = surface;
  return wrappedSvg;
}

//////////////////////////////////////////////////////////////////////////////
// A 2D plotting library

export function create(div, width, height, opts) {
  opts = cscheid.object.defaults(opts, {
    xScale: d3.scaleLinear,
    yScale: d3.scaleLinear
  });
  if (typeof width !== "number")
    throw new Error("Expected width to be number");
  if (typeof height !== "number")
    throw new Error("Expected height to be number");
  if (div.nodes().length === 0) {
    console.warn("WARNING: cscheid.plot.create() called with empty selection");
  }
  var dims = { width: width, height: height };
  var margins = { top: 10, bottom: 10, left: 10, right: 10 };
  var svg = div.append("svg")
      .attr("width", dims.width)
      .attr("height", dims.height);

  var annotationsGroup = svg.append("g");
  var sceneGroup = svg.append("g");
  var layers = {
    "annotations": annotationsGroup,
    "scene": sceneGroup
  };

  function addGroupToLayer(opts, defaultLayer) {
    if (opts.group)
      return opts.group;
    var layer = opts.layer || defaultLayer || "scene";
    return layers[layer].append("g");
  }

  function sceneObjectProto(opts) {
    return _.defaults({
      moveToFront: function() {
        this.group.moveToFront();
      },
      moveToBack: function() {
        this.group.moveToBack();
      },
      marks: function() {
        return this.group.selectAll("*");
      }
    }, opts);
  }

  var xScale = opts.xScale().range([margins.left, dims.width - margins.right]);
  var yScale = opts.yScale().range([dims.height - margins.bottom, margins.top]);
  var scene = [];

  var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  function defaultAccessor(accessors, key, defaultValue) {
    if (!accessors[key])
      return function() { return defaultValue; };
    if (typeof accessors[key] === "function")
      return accessors[key];
    else
      return function() { return accessors[key]; };
  }

  function setPaths(accessors) {
    return function(sel) {
      for (var key in accessors) {
        if (key !== "custom") {
          sel.attr(key, accessors[key]);
        } else {
          sel.call(accessors.custom);
        }
      }
    };
  }
  
  function setPoints(accessors) {
    var colorAccessor;
    var radiusAccessor = defaultAccessor(accessors, "r", 2);
    if (accessors.class) {
      colorAccessor = function(d,i) {
        return colorScale(accessors.class(d,i));
      };
    } else if (accessors.color) {
      colorAccessor = function(d,i) {
        return accessors.color(d,i);
      };
    } else {
      colorAccessor = function() { return "black"; };
    }
    return function(sel) {
      if (accessors.x)
        sel.attr("cx",  function(d,i) { return xScale(accessors.x(d,i)); });
      if (accessors.y)
        sel.attr("cy",   function(d,i) { return yScale(accessors.y(d,i)); });
      sel.attr("fill", function(d,i) { return colorAccessor(d,i); })
        .attr("r",    function(d,i) { return radiusAccessor(d,i); })
        .call(accessors.custom || function() {});
    };
  }

  function setLines(accessors) {
    var strokeAccessor = defaultAccessor(accessors, "stroke", "black");
    return function(sel) {
      if (accessors.x1)
        sel.attr("x1",    function(d,i) { return xScale(accessors.x1(d,i)); });
      if (accessors.x2)
        sel.attr("x2",    function(d,i) { return xScale(accessors.x2(d,i)); });
      if (accessors.y1)
        sel.attr("y1",    function(d,i) { return yScale(accessors.y1(d,i)); });
      if (accessors.y2)
        sel.attr("y2",    function(d,i) { return yScale(accessors.y2(d,i)); });
      if (accessors.stroke)
        sel.attr("stroke", strokeAccessor);
      sel.call(accessors.custom || function() {});
    };
  }

  function setText(accessors) {
    var fillAccessor = defaultAccessor(accessors, "fill", "black");
    var textAccessor = defaultAccessor(accessors, "text", "");
    return function(sel) {
      if (accessors.x)
        sel.attr("x",   function(d, i) { return xScale(accessors.x(d, i)); });
      if (accessors.y)
        sel.attr("y",   function(d, i) { return yScale(accessors.y(d, i)); });
      if (accessors.fill)
        sel.attr("fill", fillAccessor);
      if (accessors.text)
        sel.text(function(d, i) { return textAccessor(d, i); });
      sel.call(accessors.custom || function() {});
    };
  }

  function setGroup(accessors) {
    return function(sel) {
      sel.call(accessors.custom || function() {});
    };
  }
  
  // FIXME: arrows will be drawn really weirdly if chart aspect ratio
  // doesn't match scale ratios (that is, you need the same units for x
  // and y in the range)
  var warnedAboutAspectRatio = false;
  function setArrows(accessors) {
    var colorAccessor;
    if (accessors.class) {
      colorAccessor = function(d,i) {
        return colorScale(accessors.class(d,i));
      };
    } else if (accessors.color) {
      colorAccessor = function(d,i) {
        return accessors.color(d,i);
      };
    } else {
      colorAccessor = function() { return "black"; };
    }

    function arrowShape(d) {
      var p = accessors.vector(d);
      // var p = d.rangePerturbation || reader.project(d);
      var l = Math.sqrt(cscheid.linalg.norm2(p)); // this is the length in world-scale; need to map to length in screen-space
      var sx = Math.abs(xScale(1) - xScale(0)), sy = Math.abs(yScale(1) - yScale(0));
      if (!warnedAboutAspectRatio &&
          !math.withEps(0.01, () => math.withinEpsRel(sx, sy))) {
        warnedAboutAspectRatio = true;
        console.warn("Drawing arrows in a non-square axis pair of aspect ratio ", sx/sy);
      }

      var arrowHeadScale = (accessors.arrowHeadScale || function() { return 1; })(d);
      var negOne = String(-1 * arrowHeadScale);
      var negTwo = String(-2 * arrowHeadScale);
      var one = String(arrowHeadScale);
      var two = String(2 * arrowHeadScale);
      return "M 0 0 L " + (l * sx * accessors.scale) + " 0 l 0 " + negOne
        + " l " + two + " " + one
        + " l " + negTwo + " " + one
        + " l 0 " + negOne;
    }
    function arrowTransform(d) {
      var p = accessors.vector(d);
      var a;
      if (cscheid.linalg.norm2(p) === 0) {
        a = 0;
      } else {
        a = -Math.atan2(p[1], p[0]) * 180 / Math.PI;
      }
      var x = xScale(d.p[0]);
      var y = yScale(d.p[1]);

      return "translate(" + x + ", " + y + ")" + "rotate(" + a + ")";
    }
    return function(sel) {
      sel.attr("d", arrowShape)
        .attr("transform", arrowTransform)
        .attr("stroke", colorAccessor)
        .attr("fill", colorAccessor)
        .call(accessors.custom || function() {});
    };
  }

  function createSceneObject(opts) {
    var group = addGroupToLayer(opts);
    var element = opts.element;
    group.selectAll(element).data(opts.data)
      .enter()
      .append(element);
    var sceneObject = sceneObjectProto({
      group: group,
      accessors: opts.accessors,
      update: function(transition) {
        var sel = this.group.selectAll(element);
        return (transition ? sel.transition().call(transition) : sel).call(opts.setter(this.accessors));
      }
    });
    sceneObject.update();
    scene.push(sceneObject);
    return sceneObject;
  }

  var result = {

    // FIXME: I don't like exposing the scales: if clients change
    // settings directly, they need to remember to call update().
    xScale: xScale,
    yScale: yScale,
    classColorScale: colorScale,

    /*
     * render()     updates the scene without a transition
     * render(true) updates the scene with a default transition
     * render(f)    updates the scene with sel.transition().call(f)
     */
    render: function(transition) {
      if (transition === true)
        transition = d => d;
      scene.forEach(function(sceneObject) {
        sceneObject.update(transition);
      });
    },
    xDomain: function() {
      return xScale.domain();
    },
    setXDomain: function(domain) {
      xScale.domain(domain);
      result.render();
    },
    yDomain: function() {
      return yScale.domain();
    },
    setYDomain: function(domain) {
      yScale.domain(domain);
      result.render();
    },
    setMargins: function(obj) {
      if (obj.top !== undefined) margins.top = obj.top;
      if (obj.bottom !== undefined) margins.bottom = obj.bottom;
      if (obj.left !== undefined) margins.left = obj.left;
      if (obj.right !== undefined) margins.right = obj.right;
      xScale.range([margins.left, dims.width - margins.right]);
      yScale.range([dims.height - margins.bottom, margins.top]);
      result.render();
    },

    addGroupToLayer: addGroupToLayer,
    
    //////////////////////////////////////////////////////////////////
    // annotations
    
    addXAxis: function(opts) {
      opts = cscheid.object.defaults(opts, {
        yBaseline: Math.min.apply(null, yScale.domain()),
        orientation: "bottom"
      });
      var axisFuns = {
        "bottom": d3.axisBottom,
        "top": d3.axisTop
      };
      var axis = axisFuns[opts.orientation](xScale);
      if (opts.ticks !== undefined)
        axis.ticks(opts.ticks);
      var axisP = addGroupToLayer(opts, "annotations")
          .attr("transform", "translate(0," + yScale(opts.yBaseline) + ")");
      var axisG = axisP.append("g");
      var axisTitleG = axisP.append("g");
      var sceneObject = sceneObjectProto({
        group: axisG,
        titleGroup: axisTitleG,
        axisObject: axis,
        update: function(transition) {
          return (transition ? axisG.transition().call(transition) : axisG).call(axis);
        },
      });
      if (opts.title) {
        axisTitleG
          .append("text")
          .text(opts.title)
          .attr("x", d3.mean(xScale.range()))
          .attr("y", axis.orientation === "bottom" ? -15 : 15)
          .attr("dominant-baseline", "hanging")
          .call(cscheid.css.centerHorizontalText);
      }
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    },
    addYAxis: function(opts) {
      opts = cscheid.object.defaults(opts, {
        xBaseline: Math.min.apply(null, xScale.domain()),
        orientation: "left"
      });
      var axisFuns = {
        "left": d3.axisLeft,
        "right": d3.axisRight
      };
      var axis = axisFuns[opts.orientation](yScale);
      if (opts.ticks !== undefined)
        axis.ticks(opts.ticks);
      var axisP = addGroupToLayer(opts, "annotations")
          .attr("transform", "translate(" + xScale(opts.xBaseline) + ",0)");
      var axisG = axisP.append("g");
      var axisTitleG = axisP.append("g");
      var sceneObject = sceneObjectProto({
        group: axisG,
        titleGroup: axisTitleG,
        axisObject: axis,
        update: function(transition) {
          return (transition ? axisG.transition().call(transition) : axisG).call(axis);
        }
      });
      if (opts.title) {
        axisTitleG
          .append("text")
          .text(opts.title)
          .attr("x", axis.orientation === "left" ? 30 : -30)
          .attr("y", d3.mean(yScale.range()))
          .call(cscheid.css.centerVerticalText);
      }
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    },

    //////////////////////////////////////////////////////////////////
    // clipping path

    addClipPath: function() {
      return svg.append("clipPath");
    },

    addAxisClipPath: function() {
      var result = this.addClipPath();
      result
        // come, ye random bits, and deliver us from hurt
        .attr("id", "clip-path-" + String(Math.random()).slice(2,10))
        .append("rect")
        .attr("width", Math.abs(xScale.range()[1] - xScale.range()[0]))
        .attr("x", Math.min.apply(null, xScale.range()))
        .attr("height", Math.abs(yScale.range()[1] - yScale.range()[0]))
        .attr("y", Math.min.apply(null, yScale.range()));
      return result;
    },

    //////////////////////////////////////////////////////////////////
    // marks

    addPaths: function(data, accessors) {
      return createSceneObject({
        element: "path",
        accessors: accessors,
        data: data,
        setter: setPaths,
        layer: accessors.layer,
        group: accessors.group
      });
    },
    addPoints: function(data, accessors) {
      return createSceneObject({
        element: "circle",
        accessors: accessors,
        data: data,
        setter: setPoints,
        layer: accessors.layer,
        group: accessors.group
      });
    },
    addArrows: function(data, accessors) {
      return createSceneObject({
        element: "path",
        accessors: accessors,
        data: data,
        setter: setArrows,
        layer: accessors.layer,
        group: accessors.group
      });
    },
    addLines: function(data, accessors) {
      return createSceneObject({
        element: "line",
        accessors: accessors,
        data: data,
        setter: setLines,
        layer: accessors.layer,
        group: accessors.group
      });
    },
    addText: function(data, accessors) {
      return createSceneObject({
        element: "text",
        accessors: accessors,
        data: data,
        setter: setText,
        layer: accessors.layer,
        group: accessors.group
      });
    },
    addGroup: function(data, accessors) {
      return createSceneObject({
        element: "g",
        accessors: accessors,
        data: data,
        setter: setGroup,
        layer: accessors.layer,
        group: accessors.group
      });
    },
    addFunction: function(f, accessors) {
      accessors = accessors || {};
      accessors.value = function() { return f; };
      return this.addCurves([null], accessors);
    },
    addContours: function(scalarField, accessors,
                          xGridScale, yGridScale) {
      if (accessors === undefined) {
        var fieldExtent = d3.extent(scalarField.scalarField);
        var contourScale = d3.scaleLinear().domain([0,9]).range(fieldExtent);
        accessors = {
          contourValues: d3.range(0,10).map(contourScale)
        };
      }

      xGridScale = xGridScale || d3.scaleLinear()
        .domain([0, scalarField.dims[0]])
        .range(xScale.domain());
      yGridScale = yGridScale || d3.scaleLinear()
        .domain([0, scalarField.dims[1]])
        .range(yScale.domain());

      function contourPath(contour) {
        function pointFun(p) {
          return xScale(xGridScale(p[0])) + " " + yScale(yGridScale(p[1]));
        }
        return contour.coordinates.map(
          as => as.map(
            a => a.map(
              (v, i) => (i === 0 ? "M " : "L ") + pointFun(v))
              .join(" "))
            .join(" "))
          .join(" ");
      }
      var oldScalarField = new Float64Array(scalarField.scalarField);
      var oldContourValues = new Float64Array(scalarField.contourValues);
      function setContours()
      {
        var contours = d3.contours()
            .size(scalarField.dims)
            .thresholds(scalarField.contourValues)(scalarField.scalarField);
        return contours;
      }
      var group = addGroupToLayer(accessors);
      var element = "path";
      group.selectAll(element).data(setContours())
        .enter()
        .append(element);
      var sceneObject = sceneObjectProto({
        group: group,
        accessors: accessors,
        update: function(transition) {
          var sel = group.selectAll(element).data(setContours());
          var newScalarField = scalarField.scalarField;
          var newContourValues = scalarField.contourValues;
          var tweenField = new Float64Array(newScalarField);
          // d3 threshold array have to be Array objects, not TypedArray objects.
          var tweenContour = Array.prototype.slice(newContourValues);

          if (transition) {
            var obj = {};
            d3.select(obj).transition().call(transition)
              .tween("attr.d", function() {
                return function(t) {
                  blas.copy(newScalarField, tweenField);
                  blas.axby(1-t, oldScalarField, t, tweenField);

                  blas.copy(newContourValues, tweenContour);
                  blas.axby(1-t, oldContourValues, t, tweenContour);

                  var c = d3.contours()
                      .size(scalarField.dims)
                      .thresholds(tweenContour)(tweenField);

                  sel.data(c).attr("d", contourPath);
                };
              })
              .on("end", () => {
                // inefficient since it's called many times, whatever.
                oldScalarField = new Float64Array(newScalarField);
                oldContourValues = new Float64Array(newContourValues);
              });

            return sel.transition().call(transition)
              .attr("stroke", accessors.stroke || "black")
              .attr("fill", accessors.fill || "none")
              .attr("stroke-dasharray", accessors["stroke-dasharray"] || null)
              .attr("stroke-dashoffset", accessors["stroke-dashoffset"] || null)
              .style("stroke-width", accessors["stroke-width"] || null)
            ;
          } else {
            var result = sel.call((function(accessors) {
              return function(sel) {
                sel.attr("d", contourPath)
                  .attr("stroke", accessors.stroke || "black")
                  .attr("fill", accessors.fill || "none")
                  .attr("stroke-dasharray", accessors["stroke-dasharray"] || null)
                  .attr("stroke-dashoffset", accessors["stroke-dashoffset"] || null)
                  .style("stroke-width", accessors["stroke-width"] || null);
              };
            })(this.accessors));
            oldScalarField = new Float64Array(newScalarField);
            oldContourValues = new Float64Array(newContourValues);
            return result;
          }
        }
      });
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    },
    // FIXME: this method really only makes sense for functions.
    addCurves: function(data, accessors) {
      var group = addGroupToLayer(accessors);
      group.selectAll("path")
        .data(data)
        .enter()
        .append("path");

      var line = d3.line();
      line.x(function(d) { return xScale(d.x); });
      line.y(function(d) { return yScale(d.y); });

      var lineResolution = 250;

      var sceneObject = sceneObjectProto({
        group: group,
        accessors: accessors,
        update: function(transition) {
          var that = this;
          var sel = group.selectAll("path");
          return (transition ? sel.transition().call(transition) : sel)
            .attr("d", function(d,ix) {
              var x2 = d3.scaleLinear().domain([0, lineResolution]).range(xScale.domain());
              var pts = [];
              var value = that.accessors.value(d,ix);
              for (var i=0; i<lineResolution; ++i) {
                var x = x2(i);
                pts.push({x: x, y: value(x)});
              }
              return line(pts);
            })
            .attr("stroke", defaultAccessor(accessors, "color", "black"))
            .attr("fill", "none")
            .call(defaultAccessor(accessors, "custom", function() {}));
        }
      });
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    }
  };
  return result;
}
