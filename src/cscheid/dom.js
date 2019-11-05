import * as cscheid from "../cscheid.js";

/*
 * dom.js: interact with the Document Object Model (and some web browser stuff)
 */

/** 
 * creates elements (by default divs) that are horizontally centered
 * on the webpage
 *
 * @param {sel} input d3 selection with parents
 * @param {el}  input element name, by default "div"
 * @returns {d3 selection} selection containing created elements
 */
export function makeCenteredElement(sel, el) {
  // https://stackoverflow.com/questions/618097/how-do-you-easily-horizontally-center-a-div-using-css
  el = el || "div";
  return sel.append("div")
    .style("text-align", "center")
    .append(el)
    .style("display", "inline-block");
};

/**
 * Creates canvas drawing context and sets up High-DPI rendering,
 * keeping the rendering coordinate systems consistent with the
 * low-DPI case
 * 
 * @param {canvas} input canvas DOM element
 * @returns {Canvas drawing context} the newly created canvas drawing context
 */
// FIXME: should `canvas` be a d3 selection?
export function setupCanvas(canvas) {
  // https://www.html5rocks.com/en/tutorials/canvas/hidpi/
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

// this is slow!
/**
 * Converts position from any CSS units to pixel units. This is useful, for
 * example, to determine the vertical center of a window by calling it with '0.5vh',
 * and so on.
 *
 * @param {size} input size description, as a string
 * @returns {Number} size in CSS pixels
 */
export function convertToPixelUnits(size) {
  var d = d3.select("body").append("div").style("position", "absolute").style("left", size);
  var v1 = d.node().getBoundingClientRect().x;
  d.style("left", null);
  var v2 = d.node().getBoundingClientRect().x;
  d.remove();
  return v1 - v2;
}

/** 
 * Sets up an animation callback loop with requestAnimationFrame.
 * 
 * @param {fun} input animation callback to be called at every rendering tick.
 * @returns {stop callback} a callback that will stop the animation.
 */
export function animate(fun) {
  let stop = false;
  function tick() {
    fun();
    if (!stop) {
      window.requestAnimationFrame(tick);
    }
  }
  function stopAnimation() {
    stop = true;
  }
  window.requestAnimationFrame(tick);
  return stopAnimation;
}
