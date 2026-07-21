import { keybind } from '../inputHandlers/keybind.js';
import { layer } from '../workspaceElements/layer.js';
import { previewLayer } from '../workspaceElements/previewLayer.js';
import { vertex } from '../workspaceElements/vertex.js';
import { svgMapHolder, canvas } from '../dataStructures/utils.js';
import { vector2 } from '../dataStructures/vector2.js';
import { keybinds } from '../inputHandlers/keybinds.js';

export class app {
    #keybinds = new Map();
    #keysDown = new Map();
    #mousemoveCallback = (keyMan) => {};
    #currentLayer;
    #previewLayer;
    #layers = [];
    #mouseX;
    #mouseY;

    selectedVertices = new Set();

    constructor() {
        this.#previewLayer = new previewLayer();
        this.#previewLayer.initializePreviewVertex();

        document.addEventListener("mousemove", (ev) => {
            this.#mouseX = ev.clientX;
            this.#mouseY = ev.clientY;

            this.#previewLayer.updatePreview(this.#mouseX, this.#mouseY);
            this.#mousemoveCallback(this);
        });

        document.addEventListener("keydown", (ev) => {
            this.keyDown(ev.key);
        });

        document.addEventListener("keyup", (ev) => {
            this.keyUp(ev.key);
        });

        document.addEventListener("mousedown", () => {
            this.keyDown("Mouse1");
        })

        document.addEventListener("mouseup", () => {
            this.keyUp("Mouse1");
        })
    }

    setCurrentLayer(layer) {
        this.#currentLayer = layer;
    }

    setMousemoveCallback(callback) {
        this.#mousemoveCallback = callback;
    }

    getCurrentLayer() {
        return this.#currentLayer;
    }

    getKeyStr() {
        return Array.from(this.#keysDown.keys()).join('+');
    }

    selectVertex(vert) {
        this.selectedVertices.add(vert);
        const circle = vert.getCircle();
        circle.setAttribute("stroke", "#298dff");
        circle.setAttribute("stroke-width", 2);
        circle.setAttribute("r", this.#currentLayer.getVertexRadius() + 2);
    }

    unselectedVertex(vert) {
        this.selectedVertices.delete(vert);
        const circle = vert.getCircle();
        circle.removeAttribute("stroke");
        circle.removeAttribute("stroke-width");
        circle.setAttribute("r", this.#currentLayer.getVertexRadius());
    }

    clearSelectedVertices() {
        for (const vert of this.selectedVertices)
            this.unselectedVertex(vert);
    }

    createLayer() {
        const l = new layer();
        this.#layers.push(l);

        return l;
    }

    createKeybind(keyStr, downFunc, upFunc) {
        this.#keybinds.set(keyStr, new keybind(keyStr, downFunc, upFunc, this));
    }

    keyDown(key) {
        this.#keysDown.set(key, true);

        const keyStr = this.getKeyStr();
        const kb = this.#keybinds.get(keyStr);
        
        if (kb != null) {
            kb.down();
        }
    }

    keyUp(key) {
        const keyStr = this.getKeyStr();
        const kb = this.#keybinds.get(keyStr);

        if (kb != null) {
            kb.up();
        }

        this.#keysDown.delete(key);
    }

    getMouseCoords() {
        return [this.#mouseX, this.#mouseY];
    }
}