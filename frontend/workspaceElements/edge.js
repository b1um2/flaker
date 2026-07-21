import { svgMapHolder } from "../dataStructures/utils.js";

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

        const [x1, y1] = vert1.getCoords();
        const [x2, y2] = vert2.getCoords();
        const [pixelsX1, pixelsY1] = parentLayer.unitsToPixels(x1, y1);
        const [pixelsX2, pixelsY2] = parentLayer.unitsToPixels(x2, y2);
        const id = edge.getUniqueId(vert1, vert2);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("class", "edge");
        line.setAttribute("id", `edge-id`);
        line.setAttribute("x1", pixelsX1);
        line.setAttribute("y1", pixelsY1);
        line.setAttribute("x2", pixelsX2);
        line.setAttribute("y2", pixelsY2);
        line.setAttribute("stroke", "#b4b4b4");
        line.setAttribute("stroke-width", "2");

        svgMapHolder.appendChild(line);

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

    appendEdgeVertex(edgeVertex) {
        this.#edgeVertices.add(edgeVertex);
    }

    deleteEdgeVertex(edgeVertex) {
        this.#edgeVertices.delete(edgeVertex);
    }

    clearEdgeVertices() {
        for (let vert of this.#edgeVertices.values()) {
            vert.destroy();
            this.deleteEdgeVertex(vert);
        }
    }

    redraw() {
        const line = this.#line;

        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "#b4b4b4");
        line.setAttribute("stroke-width", "2");
    }

    destroy() {
        if (this.#destroyed) return;

        this.clearEdgeVertices();
        this.#line.remove();
        this.#destroyed = true;
        this.#parentLayer = null;
        this.#vert1.destroyEdge(this.#id);
        this.#vert2.destroyEdge(this.#id);
    }
}