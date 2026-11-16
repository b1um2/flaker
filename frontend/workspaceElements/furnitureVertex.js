import { vertex } from './vertex.js';
import { vertexGroup, SVG_NS } from '../dataStructures/utils.js';

export class furnitureVertex extends vertex {
    #width;
    #height;
    #pixelsWidth;
    #pixelsHeight;
    #rotation = 0;
    #group;
    #outline;

    constructor(x, y, parentLayer, width, height) {
        super(x, y, parentLayer);

        this.#width = width;
        this.#height = height;

        const [pixelsWidth, pixelsHeight] = parentLayer.unitsToPixelsSize(width, height);
        this.#pixelsWidth = pixelsWidth;
        this.#pixelsHeight = pixelsHeight;

        this.getCircle().setAttribute("visibility", "hidden");

        const group = document.createElementNS(SVG_NS, "g");
        group.setAttribute("class", "furniture");
        vertexGroup.appendChild(group);

        const outline = document.createElementNS(SVG_NS, "rect");
        outline.setAttribute("class", "furniture-outline");
        outline.setAttribute("x", -pixelsWidth / 2);
        outline.setAttribute("y", -pixelsHeight / 2);
        outline.setAttribute("width", pixelsWidth);
        outline.setAttribute("height", pixelsHeight);
        outline.setAttribute("rx", 4);
        outline.setAttribute("fill", "#38454b");
        outline.setAttribute("stroke", "#6d7b82");
        outline.setAttribute("stroke-width", 1.5);
        group.appendChild(outline);

        this.#group = group;
        this.#outline = outline;

        this.#updateTransform();
    }

    getWidth() {
        return this.#width;
    }

    getHeight() {
        return this.#height;
    }

    getPixelSize() {
        return [this.#pixelsWidth, this.#pixelsHeight];
    }

    getGroup() {
        return this.#group;
    }

    getOutline() {
        return this.#outline;
    }

    getHitRadius() {
        return Math.sqrt(this.#width ** 2 + this.#height ** 2) / 2 + 0.1;
    }

    usesScreenSpaceHitRadius() {
        return false;
    }

    canConnect() {
        return false;
    }

    canRotate() {
        return true;
    }

    getRotation() {
        return this.#rotation;
    }

    rotate(degrees) {
        this.#rotation = (this.#rotation + degrees) % 360;

        if (this.#rotation < 0)
            this.#rotation += 360;

        this.#updateTransform();
    }

    addRect(x, y, width, height, fill, radius = 0) {
        const rect = document.createElementNS(SVG_NS, "rect");

        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", width);
        rect.setAttribute("height", height);
        rect.setAttribute("fill", fill);

        if (radius > 0)
            rect.setAttribute("rx", radius);

        this.#group.appendChild(rect);

        return rect;
    }

    addLine(x1, y1, x2, y2) {
        const line = document.createElementNS(SVG_NS, "line");

        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "#78878e");
        line.setAttribute("stroke-width", 1.5);
        line.setAttribute("stroke-linecap", "round");

        this.#group.appendChild(line);

        return line;
    }

    setSelected(selected) {
        if (this.#outline == null) return;

        if (selected) {
            this.#outline.setAttribute("stroke", "#298dff");
            this.#outline.setAttribute("stroke-width", 2.5);
        } else {
            this.#outline.setAttribute("stroke", "#6d7b82");
            this.#outline.setAttribute("stroke-width", 1.5);
        }
    }

    moveTo(unitsX, unitsY) {
        super.moveTo(unitsX, unitsY);
        this.#updateTransform();
    }

    #updateTransform() {
        if (this.#group == null) return;

        const [unitsX, unitsY] = this.getCoords();
        const [pixelsX, pixelsY] = this.getLayer().unitsToPixels(unitsX, unitsY);

        this.#group.setAttribute("transform", `translate(${pixelsX} ${pixelsY}) rotate(${this.#rotation})`);
    }

    destroy() {
        if (this.#group == null) return;

        this.#group.remove();
        this.#group = null;
        this.#outline = null;

        super.destroy();
    }
}
