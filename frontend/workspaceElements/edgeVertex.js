import { svgMapHolder } from "../dataStructures/utils.js";
import { vertex } from "./vertex.js";
import { vector2 } from "../dataStructures/vector2.js";

export class edgeVertex extends vertex {
    #widthAlongLine;
    #line;
    #edge;

    constructor(x, y, widthAlongLine, edge, parentLayer) {
        super(x, y, parentLayer);

        const [vert1, vert2] = edge.getVertices();
        const [x1, y1] = vert1.getCoords();
        const [x2, y2] = vert2.getCoords();

        const origin = new vector2(x, y);
        const pos1 = new vector2(x1, y1);
        const pos2 = new vector2(x2, y2);
        const direction = pos2.sub(pos1).getUnitVector();
        const linePos1 = origin.add(direction);
        const linePos2 = origin.sub(direction);

        const [lineX1, lineY1] = linePos1.getCoords();
        const [lineX2, lineY2] = linePos2.getCoords();

        const [pixelsX1, pixelsY1] = parentLayer.unitsToPixels(lineX1, lineY1);
        const [pixelsX2, pixelsY2] = parentLayer.unitsToPixels(lineX2, lineY2);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("class", "edge");
        line.setAttribute("id", `edge-id`);
        line.setAttribute("x1", pixelsX1);
        line.setAttribute("y1", pixelsY1);
        line.setAttribute("x2", pixelsX2);
        line.setAttribute("y2", pixelsY2);
        line.setAttribute("stroke", "#ededed");
        line.setAttribute("stroke-width", "4");

        svgMapHolder.appendChild(line);

        this.#line = line;

        edge.appendEdgeVertex(this);
    }

    destroy() {
        this.#line.remove();

        super.destroy();
    }
}