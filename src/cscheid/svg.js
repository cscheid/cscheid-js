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

//////////////////////////////////////////////////////////////////////////
// extra methods for the selection prototype

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
