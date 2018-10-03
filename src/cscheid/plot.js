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

export function create(div, width, height) {
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

  var xScale = d3.scaleLinear().range([margins.left, dims.width - margins.right]);
  var yScale = d3.scaleLinear().range([dims.height - margins.bottom, margins.top]);
  var scene = [];

  var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  function defaultAccessor(accessors, key, value) {
    if (accessors[key])
      return accessors[key];
    else
      return function() { return value; };
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
      sel.attr("cx", function(d,i) { return xScale(accessors.x(d,i)); })
        .attr("cy", function(d,i) { return yScale(accessors.y(d,i)); })
        .attr("fill", function(d,i) { return colorAccessor(d,i); })
        .attr("r", function(d,i) { return radiusAccessor(d,i); })
        .call(accessors.custom || function() {})
      ;
    };
  }

  function setLines(accessors) {
    var strokeAccessor = defaultAccessor(accessors, "stroke", "black");
    return function(sel) {
      sel.attr("x1", function(d,i)  { return xScale(accessors.x1(d,i)); })
        .attr("x2", function(d,i) { return xScale(accessors.x2(d,i)); })
        .attr("y1", function(d,i) { return yScale(accessors.y1(d,i)); })
        .attr("y2", function(d,i) { return yScale(accessors.y2(d,i)); })
        .attr("stroke", function(d,i) { return strokeAccessor(d,i); })
        .call(accessors.custom || function() {});
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
        a = -Math.atan2(p[0], p[1]) * 180 / Math.PI;
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

    //////////////////////////////////////////////////////////////////
    // annotations

    addXAxis: function(opts) {
      opts = opts || {
        yBaseline: 0
      };
      var axis = d3.axisBottom(xScale);
      var axisG = addGroupToLayer(opts, "annotations")
          .attr("transform", "translate(0," + yScale(opts.yBaseline) + ")");
      var sceneObject = sceneObjectProto({
        group: axisG,
        axisObject: axis,
        update: function(transition) {
          return (transition ? axisG.transition().call(transition) : axisG).call(axis);
        }
      });
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    },
    addYAxis: function(opts) {
      opts = opts || {
        xBaseline: 0
      };
      var axis = d3.axisLeft(yScale);
      var axisG = addGroupToLayer(opts, "annotations")
          .attr("transform", "translate(" + xScale(opts.xBaseline) + ",0)");
      var sceneObject = sceneObjectProto({
        group: axisG,
        axisObject: axis,
        update: function(transition) {
          return (transition ? axisG.transition().call(transition) : axisG).call(axis);
        }
      });
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    },

    //////////////////////////////////////////////////////////////////
    // marks

    addPoints: function(data, accessors) {
      return createSceneObject({
        element: "circle",
        accessors: accessors,
        data: data,
        setter: setPoints,
        layer: accessors.layer
      });
    },
    addArrows: function(data, accessors) {
      return createSceneObject({
        element: "path",
        accessors: accessors,
        data: data,
        setter: setArrows,
        layer: accessors.layer
      });
    },
    addLines: function(data, accessors) {
      return createSceneObject({
        element: "line",
        accessors: accessors,
        data: data,
        setter: setLines,
        layer: accessors.layer
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
              .tween("attr.d", function(d, i) {
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
              .on("end", d => {
                // inefficient since it's called many times, whatever.
                oldScalarField = new Float64Array(newScalarField);
                oldContourValues = new Float64Array(newContourValues);
              });

            return sel.transition().call(transition)
              .attr("stroke", accessors.stroke || "black")
              .attr("fill", accessors.fill || "none");
          } else {
            var result = sel.call((function(accessors) {
              return function(sel) {
                sel.attr("d", contourPath)
                  .attr("stroke", accessors.stroke || "black")
                  .attr("fill", accessors.fill || "none");
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
