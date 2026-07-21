import {layer} from './layer.js';
import {svgMapHolder, canvas} from '../dataStructures/utils.js';
import { vector2 } from '../dataStructures/vector2.js';

export class previewLayer extends layer {
    #previewVertex;
    #vertexRadius;
    #app;
    #virtualVertices = [];
    #selectedVertices = [];

    constructor(app) {
        super();
        this.#app = app;
        this.#vertexRadius = 7;
    }

    updatePreview(mouseX, mouseY, keys) {
        const previewVertexSVG = this.#previewVertex.getCircle();
        if (this.#app.getMode() == 'vertex') {
            const [snappedX, snappedY] = this.pixelsToSnappedPixels(mouseX, mouseY);
        
            previewVertexSVG.setAttribute("cx", snappedX);
            previewVertexSVG.setAttribute("cy", snappedY);
        } else if (this.#app.getMode() == 'edgeVertex') {
            const [edge, edgeDist, edgeX, edgeY] = this.#app.getEdge(mouseX, mouseY);
            const [snappedX, snappedY] = this.unitsToPixels(edgeX, edgeY);

            previewVertexSVG.setAttribute("cx", snappedX);
            previewVertexSVG.setAttribute("cy", snappedY);
        }
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