import { layer } from './layer.js';

export class previewLayer extends layer {
    #previewVertex;
    #vertexRadius = 7;
    #app;

    constructor(app) {
        super();
        this.#app = app;
    }

    updatePreview(mouseX, mouseY) {
        const circle = this.#previewVertex.getCircle();

        if (this.#app.getMode() == 'vertex' || this.#app.getMode() == 'furniture') {
            const [snappedX, snappedY] = this.pixelsToSnappedPixels(mouseX, mouseY);

            circle.setAttribute("cx", snappedX);
            circle.setAttribute("cy", snappedY);
            circle.setAttribute("visibility", "visible");
        } else if (this.#app.getMode() == 'edgeVertex') {
            const [edge, edgeDist, edgeX, edgeY] = this.#app.getEdge(mouseX, mouseY);

            if (edge == null) {
                circle.setAttribute("visibility", "hidden");
                return;
            }

            const [pixelsX, pixelsY] = this.unitsToPixels(edgeX, edgeY);

            circle.setAttribute("cx", pixelsX);
            circle.setAttribute("cy", pixelsY);
            circle.setAttribute("visibility", "visible");
        } else {
            circle.setAttribute("visibility", "hidden");
        }
    }

    initializePreviewVertex() {
        this.#previewVertex = this.createVertex(0, 0);

        const circle = this.#previewVertex.getCircle();
        circle.setAttribute("class", "vertex preview-vertex");
        circle.setAttribute("fill", "#28353a99");
        circle.setAttribute("visibility", "hidden");
    }

    getPreviewVertex() {
        return this.#previewVertex;
    }

    getVertexRadius() {
        return this.#vertexRadius;
    }
}
