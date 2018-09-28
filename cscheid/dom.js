import * as cscheid from "../cscheid.js";

// https://stackoverflow.com/questions/618097/how-do-you-easily-horizontally-center-a-div-using-css
export function makeCenteredElement(sel, el) {
  el = el || "div";
  return sel.append("div")
    .style("text-align", "center")
    .append(el)
    .style("display", "inline-block");
};

// https://www.html5rocks.com/en/tutorials/canvas/hidpi/
export function setupCanvas(canvas) {
  var dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  var rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // cscheid adds: we need this as well;
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";
  var ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(dpr, dpr);

  // and this is just convenient for downstream calls;
  ctx.dpr = dpr;
  return ctx;
};
