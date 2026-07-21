import {layer} from './layer.js';
import {svgMapHolder, canvas} from '../dataStructures/utils.js';
import { vector2 } from '../dataStructures/vector2.js';

export class previewLayer extends layer {
    #previewVertex;
    #vertexRadius;
    #virtualVertices = [];
    #selectedVertices = [];

    constructor() {
        super();
        this.#vertexRadius = 7;
    }

    updatePreview(mouseX, mouseY, keys) {
        const previewVertexSVG = this.#previewVertex.getCircle();
        const [snappedX, snappedY] = this.pixelsToSnappedPixels(mouseX, mouseY);
        
        previewVertexSVG.setAttribute("cx", snappedX);
        previewVertexSVG.setAttribute("cy", snappedY);
    }

    initializePreviewVertex() {
        this.#previewVertex = this.createVertex(0, 0);
        this.#previewVertex.getCircle().setAttribute("fill", "#28353a99");
    }

    getPreviewVertex() {
        return this.#previewVertex;
    }

    getVertexRadius() {
        return this.#vertexRadius;
    }

    createVirtualVertex() {
        return new vertex(0, 0, this);
    }
}