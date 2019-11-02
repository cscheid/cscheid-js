import * as cscheid from "../cscheid.js";

export function centerHorizontalText(sel) {
  sel.attr("text-anchor", "middle");
}

export function centerVerticalText(sel) {
  sel.attr("text-anchor", "middle")
    .attr("transform", cscheid.svg.centeredTextRotate(-90));
}
