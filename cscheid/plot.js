import * as cscheid from "../cscheid.js";

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
  var dims = { width: width,
               height: height };
  var margins = { top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10 };
  var svg = div.append("svg")
      .attr("width", dims.width)
      .attr("height", dims.height);

  var annotationsGroup = svg.append("g");
  var sceneGroup = svg.append("g");
  
  var xScale = d3.scaleLinear().range([margins.left, dims.width - margins.right]);

  // FIXME BUG - shouldn't this be dims.height??
  var yScale = d3.scaleLinear().range([dims.width - margins.bottom, margins.top]);
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
  
  var result = {
    
    //////////////////////////////////////////////////////////////////
    // I don't like exposing the scales: if clients change settings
    // they need to remember to call update().
    
    xScale: xScale,
    yScale: yScale,
    
    render: function(transition) {
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
      yScale.range([dims.width - margins.bottom, margins.top]);
      result.render();
    },

    //////////////////////////////////////////////////////////////////
    // annotations
    
    addXAxis: function() {
      var axis = d3.axisBottom(xScale);
      var axisG = annotationsGroup.append("g")
          .attr("transform", "translate(0," + yScale(0) + ")");
      var sceneObject = {
        group: axisG,
        axisObject: axis,
        update: function(transition) {
          (transition ? axisG.transition() : axisG).call(axis);
        }
      };
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    },
    addYAxis: function() {
      var axis = d3.axisLeft(yScale);
      var axisG = annotationsGroup.append("g")
          .attr("transform", "translate(" + xScale(0) + ",0)");
      var sceneObject = {
        group: axisG,
        axisObject: axis,
        update: function(transition) {
          (transition ? axisG.transition() : axisG).call(axis);
        }
      };
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    },
    
    //////////////////////////////////////////////////////////////////
    // marks

    addPoints: function(data, accessors) {
      var pointsGroup = sceneGroup.append("g");
      pointsGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle");
      var sceneObject = {
        group: pointsGroup,
        accessors: accessors,
        update: function(transition) {
          var sel =  pointsGroup
              .selectAll("circle");
          (transition ? sel.transition() : sel).call(setPoints(this.accessors));
        }
      };
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    },
    addLines: function(data, accessors) {
      var group = sceneGroup.append("g");
      group.selectAll("line")
        .data(data)
        .enter()
        .append("line");
      var sceneObject = {
        group: group,
        accessors: accessors,
        update: function(transition) {
          var sel = group.selectAll("line");
          (transition ? sel.transition() : sel)
            .call(setLines(this.accessors))
            .call(this.accessors.custom || function() {});
        }
      };
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    },
    addFunction: function(f, accessors) {
      accessors = accessors || {};
      accessors.value = function() { return f; };
      return this.addCurves([null], accessors);
    },
    addCurves: function(data, accessors) {
      var group = sceneGroup.append("g");
      group.selectAll("path")
        .data(data)
        .enter()
        .append("path");
      
      var line = d3.line();
      line.x(function(d) { return xScale(d.x); });
      line.y(function(d) { return yScale(d.y); });
      
      var lineResolution = 250;
      
      var sceneObject = {
        group: group,
        accessors: accessors,
        update: function(transition) {
          var that = this;
          var sel = group.selectAll("path");
          (transition ? sel.transition() : sel)
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
      };
      sceneObject.update();
      scene.push(sceneObject);
      return sceneObject;
    }
  };
  return result;
}
