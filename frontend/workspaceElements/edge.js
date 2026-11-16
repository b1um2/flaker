import { edgeGroup, SVG_NS } from "../dataStructures/utils.js";

export class edge {
    #parentLayer;
    #vert1;
    #vert2;
    #id;
    #line;
    #destroyed = false;
    #edgeVertices = new Set();

    constructor(vert1, vert2, parentLayer) {
        this.#vert1 = vert1;
        this.#vert2 = vert2;
        this.#parentLayer = parentLayer;

        const [x1, y1] = vert1.getCoords();
        const [x2, y2] = vert2.getCoords();
        const [pixelsX1, pixelsY1] = parentLayer.unitsToPixels(x1, y1);
        const [pixelsX2, pixelsY2] = parentLayer.unitsToPixels(x2, y2);
        const id = edge.getUniqueId(vert1, vert2);

        const line = document.createElementNS(SVG_NS, "line");

        line.setAttribute("class", "edge");
        line.setAttribute("id", `edge-${id}`);
        line.setAttribute("x1", pixelsX1);
        line.setAttribute("y1", pixelsY1);
        line.setAttribute("x2", pixelsX2);
        line.setAttribute("y2", pixelsY2);
        line.setAttribute("stroke", "#b4b4b4");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-linecap", "round");

        edgeGroup.appendChild(line);

        this.#line = line;
        this.#id = id;

        vert1.appendEdge(this);
        vert2.appendEdge(this);
    }

    static getUniqueId(vert1, vert2) {
        const id1 = vert1.getId();
        const id2 = vert2.getId();
        return `${Math.min(id1, id2)},${Math.max(id1, id2)}`;
    }

    getId() {
        return this.#id;
    }

    getVertices() {
        return [this.#vert1, this.#vert2];
    }

    getLine() {
        return this.#line;
    }

    getNearestPoint(unitsX, unitsY) {
        const [x1, y1] = this.#vert1.getCoords();
        const [x2, y2] = this.#vert2.getCoords();

        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx ** 2 + dy ** 2;

        let t = lengthSquared === 0
            ? 0
            : ((unitsX - x1) * dx + (unitsY - y1) * dy) / lengthSquared;

        t = Math.max(0, Math.min(1, t));

        const nearestX = x1 + t * dx;
        const nearestY = y1 + t * dy;
        const dist = Math.sqrt((unitsX - nearestX) ** 2 + (unitsY - nearestY) ** 2);

        return [nearestX, nearestY, dist, t];
    }

    appendEdgeVertex(edgeVertex) {
        this.#edgeVertices.add(edgeVertex);
    }

    deleteEdgeVertex(edgeVertex) {
        this.#edgeVertices.delete(edgeVertex);
    }

    clearEdgeVertices() {
        for (const vert of [...this.#edgeVertices]) {
            vert.destroy();
        }
    }

    redraw() {
        if (this.#destroyed) return;

        const [x1, y1] = this.#vert1.getCoords();
        const [x2, y2] = this.#vert2.getCoords();
        const [pixelsX1, pixelsY1] = this.#parentLayer.unitsToPixels(x1, y1);
        const [pixelsX2, pixelsY2] = this.#parentLayer.unitsToPixels(x2, y2);

        this.#line.setAttribute("x1", pixelsX1);
        this.#line.setAttribute("y1", pixelsY1);
        this.#line.setAttribute("x2", pixelsX2);
        this.#line.setAttribute("y2", pixelsY2);

        for (const vert of this.#edgeVertices)
            vert.updateFromEdge();

        this.#parentLayer.updateEdge(this);
    }

    destroy() {
        if (this.#destroyed) return;
        this.#destroyed = true;

        this.clearEdgeVertices();
        this.#line.remove();
        this.#parentLayer.deleteEdge(this);
        this.#vert1.destroyEdge(this.#id);
        this.#vert2.destroyEdge(this.#id);
        this.#parentLayer = null;
    }
}
