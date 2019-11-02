import * as cscheid from "../cscheid.js";

export function translateVec(v) {
  return translate(v.x, v.y);
}

export function translate(x, y) {
  if (y === undefined) {
    return "translate(" + x.x + ", " + x.y + ") ";
  } else {
    return "translate(" + x + ", " + y + ") ";
  }
}

export function rotate(r) {
  return "rotate(" + r + ") ";
}

export function useClipPath(clipEl)
{
  return function(sel) {
    var id = clipEl.attr("id");
    sel.attr("clip-path", `url(#${id})`);
  };
}

// use this when you need to rotate an object around
// its own position. (useful for text, for example)
//
// call it like this:
// .attr("transform", cscheid.svg.centeredTextRotate(-90))

export function centeredTextRotate(r)
{
  return centeredRotate(
    function(d) { return this.getAttribute("x") || 0; },
    function(d) { return this.getAttribute("y") || 0; },
    r);
}

export function centeredRotate(xAccessor, yAccessor, r) {
  return function(d) {
    var x = xAccessor.call(this, d);
    var y = yAccessor.call(this, d);
    return `rotate(${r}, ${x}, ${y})`;
  };
}

export var categoricalColorScheme = 
  ["rgb(2, 195, 219)", "rgb(255, 200, 0)", "rgb(244, 68, 82)", 
   "rgb(186, 216, 60)", "rgb(216, 145, 205)", "rgb(222, 222, 222)"];

//////////////////////////////////////////////////////////////////////////
// extra methods for the selection prototype

if (d3 !== undefined) {
  // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };

  // http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
  d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
      var firstChild = this.parentNode.firstChild;
      if (firstChild) {
        this.parentNode.insertBefore(this, firstChild);
      }
    });
  };

  d3.selection.prototype.callReturn = function(callable)
  {
    return callable(this);
  };

  d3.selection.prototype.enterMany = function(data)
  {
    return this.selectAll(".c :not(.c)")
      .data(data)
      .enter();
  };
}

