import * as cscheid from "../cscheid.js";

// Utilities to help with figures: captions, refs, etc

export function addCaption(sel, capt)
{
  var captionLine = cscheid.dom.makeCenteredElement(sel, "div");
  captionLine.style("margin-bottom", "1em");
  captionLine.append("span").text("Figure ");
  var figNumber = captionLine.append("span");
  captionLine.append("span").text(": ");
  captionLine.call(capt);
  return {
    number: figNumber,
    caption: captionLine
  };
}
