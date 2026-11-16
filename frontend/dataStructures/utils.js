//element exports
export const svgMapHolder = document.getElementById("canvas-svg");

export const SVG_NS = "http://www.w3.org/2000/svg";

export const edgeGroup = document.createElementNS(SVG_NS, "g");
export const vertexGroup = document.createElementNS(SVG_NS, "g");

// The world group is transformed when the view is zoomed or panned.
// Everything inside it stays in the same world (unit) coordinates, so the
// spatial hash grids never need to be rebuilt.
export const worldGroup = document.createElementNS(SVG_NS, "g");

worldGroup.appendChild(edgeGroup);
worldGroup.appendChild(vertexGroup);
svgMapHolder.appendChild(worldGroup);
