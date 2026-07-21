import {layer} from './layer.js';
import {edge} from './edge.js';
import {svgMapHolder, canvas} from '../dataStructures/utils.js';
import { vector2 } from '../dataStructures/vector2.js';

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

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "vertex");
        circle.setAttribute("id", `vertex-${vertex.#vertexId}`);
        circle.setAttribute("cx", pixelsX);
        circle.setAttribute("cy", pixelsY);
        circle.setAttribute("fill", "#b4b4b4");
        circle.setAttribute("r", radius);

        svgMapHolder.appendChild(circle);

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

    createEdge(vert) {
        const connectingEdge = new edge(this, vert, this.#layer);
    }

    appendEdge(edge) {
        this.#edges.set(edge.getId(), edge);
    }

    destroyEdge(id) {
        if (!this.#edges.has(id)) return;
        
        this.#edges.get(id).destroy()
        this.#edges.delete(id);
    }

    destroy() {
        if (this.#destroyed) return;

        for (let id of this.#edges.keys()) {
            this.destroyEdge(id);
        }

        this.#circle.remove();

        this.#layer.removeVertex(this);
        this.#destroyed = true;
    }
}