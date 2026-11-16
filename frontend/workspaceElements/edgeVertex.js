import { edgeGroup, SVG_NS } from "../dataStructures/utils.js";
import { vertex } from "./vertex.js";
import { vector2 } from "../dataStructures/vector2.js";

export class edgeVertex extends vertex {
    #widthAlongLine;
    #positionAlongLine;
    #line;
    #edge;

    constructor(x, y, widthAlongLine, edge, parentLayer) {
        super(x, y, parentLayer);

        this.#widthAlongLine = widthAlongLine;
        this.#edge = edge;

        const [edgeX, edgeY, dist, t] = edge.getNearestPoint(x, y);
        this.#positionAlongLine = t;

        const line = document.createElementNS(SVG_NS, "line");

        line.setAttribute("class", "edge-vertex");
        line.setAttribute("stroke", "#ededed");
        line.setAttribute("stroke-width", "4");
        line.setAttribute("stroke-linecap", "round");

        edgeGroup.appendChild(line);

        this.#line = line;

        this.#redrawMarker();

        edge.appendEdgeVertex(this);
    }

    #redrawMarker() {
        if (this.#edge == null) return;

        const [x, y] = this.getCoords();
        const [vert1, vert2] = this.#edge.getVertices();
        const [x1, y1] = vert1.getCoords();
        const [x2, y2] = vert2.getCoords();

        const direction = new vector2(x2 - x1, y2 - y1).getUnitVector();
        const halfWidth = this.#widthAlongLine / 2;
        const [startX, startY] = new vector2(x, y).sub(direction.scalar(halfWidth)).getCoords();
        const [endX, endY] = new vector2(x, y).add(direction.scalar(halfWidth)).getCoords();

        const [pixelsStartX, pixelsStartY] = this.getLayer().unitsToPixels(startX, startY);
        const [pixelsEndX, pixelsEndY] = this.getLayer().unitsToPixels(endX, endY);

        this.#line.setAttribute("x1", pixelsStartX);
        this.#line.setAttribute("y1", pixelsStartY);
        this.#line.setAttribute("x2", pixelsEndX);
        this.#line.setAttribute("y2", pixelsEndY);
    }

    moveTo(unitsX, unitsY) {
        if (this.#edge == null) return;

        const [edgeX, edgeY, dist, t] = this.#edge.getNearestPoint(unitsX, unitsY);
        this.#positionAlongLine = t;

        super.moveTo(edgeX, edgeY);
        this.#redrawMarker();
    }

    // keeps the marker on the wall when one of the wall's vertices moves
    updateFromEdge() {
        if (this.#edge == null) return;

        const [vert1, vert2] = this.#edge.getVertices();
        const [x1, y1] = vert1.getCoords();
        const [x2, y2] = vert2.getCoords();
        const unitsX = x1 + (x2 - x1) * this.#positionAlongLine;
        const unitsY = y1 + (y2 - y1) * this.#positionAlongLine;

        super.moveTo(unitsX, unitsY);
        this.#redrawMarker();
    }

    destroy() {
        if (this.#edge == null) return;

        this.#line.remove();
        this.#edge.deleteEdgeVertex(this);
        this.#edge = null;

        super.destroy();
    }
}
