import { edge } from './edge.js';
import { vertexGroup, SVG_NS } from '../dataStructures/utils.js';

export class vertex {
    static #vertexId = 0;
    #edges;
    #layer;
    #x;
    #y;
    #circle;
    #id;
    #destroyed;

    constructor(x, y, parentLayer) {
        const radius = parentLayer.getVertexRadius();
        const [pixelsX, pixelsY] = parentLayer.unitsToPixels(x, y); //get the actual pixels of where it should be

        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("class", "vertex");
        circle.setAttribute("id", `vertex-${vertex.#vertexId}`);
        circle.setAttribute("cx", pixelsX);
        circle.setAttribute("cy", pixelsY);
        circle.setAttribute("fill", "#b4b4b4");
        circle.setAttribute("r", radius);

        vertexGroup.appendChild(circle);

        this.#edges = new Map();
        this.#circle = circle;
        this.#x = x;
        this.#y = y;
        this.#layer = parentLayer;
        this.#id = vertex.#vertexId;
        this.#destroyed = false;

        vertex.#vertexId++;
    }

    getCircle() {
        return this.#circle;
    }

    getCoords() {
        return [this.#x, this.#y];
    }

    getLayer() {
        return this.#layer;
    }

    getId() {
        return this.#id;
    }

    getHitRadius() {
        return 0.4;
    }

    usesScreenSpaceHitRadius() {
        return true;
    }

    canConnect() {
        return true;
    }

    canRotate() {
        return false;
    }

    canResize() {
        return false;
    }

    setSelected(selected) {
        if (selected) {
            this.#circle.setAttribute("stroke", "#298dff");
            this.#circle.setAttribute("stroke-width", 2);
            this.#circle.setAttribute("r", this.#layer.getVertexRadius() + 2);
        } else {
            this.#circle.removeAttribute("stroke");
            this.#circle.removeAttribute("stroke-width");
            this.#circle.setAttribute("r", this.#layer.getVertexRadius());
        }
    }

    createEdge(vert) {
        return this.#layer.createEdge(this, vert);
    }

    appendEdge(edge) {
        this.#edges.set(edge.getId(), edge);
    }

    destroyEdge(id) {
        const edge = this.#edges.get(id);
        if (edge == null) return;

        edge.destroy();
        this.#edges.delete(id);
    }

    moveTo(unitsX, unitsY) {
        if (this.#destroyed) return;

        this.#layer.updateVertex(this, unitsX, unitsY);

        this.#x = unitsX;
        this.#y = unitsY;

        const [pixelsX, pixelsY] = this.#layer.unitsToPixels(unitsX, unitsY);
        this.#circle.setAttribute("cx", pixelsX);
        this.#circle.setAttribute("cy", pixelsY);

        for (const edge of this.#edges.values())
            edge.redraw();
    }

    destroy() {
        if (this.#destroyed) return;
        this.#destroyed = true;

        for (let id of [...this.#edges.keys()]) {
            this.destroyEdge(id);
        }

        this.#circle.remove();

        this.#layer.removeVertex(this);
    }
}
