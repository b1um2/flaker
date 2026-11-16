import { keybind } from '../inputHandlers/keybind.js';
import { layer } from '../workspaceElements/layer.js';
import { previewLayer } from '../workspaceElements/previewLayer.js';
import { svgMapHolder } from '../dataStructures/utils.js';

const modifierOrder = ['Control', 'Shift', 'Alt', 'Meta'];
const modifierKeys = new Set(modifierOrder);

export class app {
    #keybinds = new Map();
    #keysDown = new Set();
    #activeKeybinds = new Map();
    #currentLayer;
    #previewLayer;
    #layers = [];
    #mode = 'vertex';
    #furnitureType = 'couch';
    #mouseX = 0;
    #mouseY = 0;
    #mouseMoved = false;
    #drag = null;
    #panning = null;

    selectedVertices = new Set();
    selectedEdges = new Set();

    constructor() {
        this.#previewLayer = new previewLayer(this);
        this.#previewLayer.initializePreviewVertex();

        document.addEventListener("mousemove", (ev) => {
            if (this.#panning != null) {
                // Stop panning if the middle button was released outside the window.
                if ((ev.buttons & 4) === 0) {
                    this.#panning = null;
                    delete document.body.dataset.panning;
                    return;
                }

                const dx = ev.clientX - this.#panning.x;
                const dy = ev.clientY - this.#panning.y;
                this.#panning.x = ev.clientX;
                this.#panning.y = ev.clientY;

                this.#currentLayer.panBy(dx, dy);
                this.#updateMouse(ev);
                this.#previewLayer.updatePreview(this.#mouseX, this.#mouseY);
                return;
            }

            if (this.#isUiClick(ev)) return;

            this.#updateMouse(ev);
            this.#previewLayer.updatePreview(this.#mouseX, this.#mouseY);
            this.updateDrag();
        });

        document.addEventListener("keydown", (ev) => {
            if (ev.key === '=' || ev.key === '+') {
                ev.preventDefault();
                if (!ev.repeat) this.zoomIn();
                return;
            }

            if (ev.key === '-' || ev.key === '_') {
                ev.preventDefault();
                if (!ev.repeat) this.zoomOut();
                return;
            }

            if (ev.key === '0') {
                ev.preventDefault();
                if (!ev.repeat) this.resetZoom();
                return;
            }

            this.keyDown(ev.key);
        });

        document.addEventListener("keyup", (ev) => {
            this.keyUp(ev.key);
        });

        document.addEventListener("mousedown", (ev) => {
            if (this.#isUiClick(ev)) return;

            if (ev.button === 1) {
                ev.preventDefault();
                this.endDrag();
                this.#panning = { x: ev.clientX, y: ev.clientY };
                document.body.dataset.panning = "true";
                return;
            }

            if (ev.button !== 0) return;

            this.#updateMouse(ev);
            this.keyDown("Mouse1");
        });

        document.addEventListener("mouseup", (ev) => {
            if (ev.button === 1) {
                this.#panning = null;
                delete document.body.dataset.panning;
                return;
            }

            if (ev.button !== 0) return;

            if (!this.#isUiClick(ev)) {
                this.#updateMouse(ev);
                this.updateDrag();
            }

            this.keyUp("Mouse1");
        });

        document.addEventListener("auxclick", (ev) => {
            if (ev.button === 1) ev.preventDefault();
        });

        svgMapHolder.addEventListener("wheel", (ev) => {
            ev.preventDefault();
            this.endDrag();

            const rect = svgMapHolder.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const y = ev.clientY - rect.top;
            const delta = ev.deltaMode === 1 ? ev.deltaY * 16 : ev.deltaMode === 2 ? ev.deltaY * 100 : ev.deltaY;
            const factor = Math.min(2, Math.max(0.5, Math.exp(-delta * 0.0015)));

            this.#currentLayer.zoomAt(x, y, factor);

            this.#updateMouse(ev);
            this.#previewLayer.updatePreview(this.#mouseX, this.#mouseY);
        }, { passive: false });

        window.addEventListener("blur", () => {
            this.#keysDown.clear();
            this.#activeKeybinds.clear();
            this.endDrag();
            this.#panning = null;
            delete document.body.dataset.panning;
        });
    }

    #updateMouse(ev) {
        const rect = svgMapHolder.getBoundingClientRect();

        this.#mouseX = ev.clientX - rect.left;
        this.#mouseY = ev.clientY - rect.top;
        this.#mouseMoved = true;
    }

    #isUiClick(ev) {
        return ev.target.closest("#tool-select, #furniture-menu") != null;
    }

    #getZoomCenter(forceCenter = false) {
        const rect = svgMapHolder.getBoundingClientRect();

        if (!forceCenter
            && this.#mouseMoved
            && this.#mouseX >= 0 && this.#mouseX <= rect.width
            && this.#mouseY >= 0 && this.#mouseY <= rect.height)
            return [this.#mouseX, this.#mouseY];

        return [rect.width / 2, rect.height / 2];
    }

    setCurrentLayer(layer) {
        this.#currentLayer = layer;
    }

    setMode(mode) {
        const changed = mode !== this.#mode;

        this.#mode = mode;

        for (const button of document.querySelectorAll("#tool-select button"))
            button.classList.toggle("active", button.dataset.mode === mode);

        document.body.dataset.mode = mode;

        const menu = document.getElementById("furniture-menu");
        if (menu)
            menu.classList.toggle("visible", mode === 'furniture');

        if (changed) {
            this.clearSelection();
            this.endDrag();
        }

        if (this.#mouseMoved)
            this.#previewLayer.updatePreview(this.#mouseX, this.#mouseY);
    }

    setFurnitureType(type) {
        this.#furnitureType = type;

        for (const button of document.querySelectorAll("#furniture-menu button"))
            button.classList.toggle("active", button.dataset.type === type);
    }

    getFurnitureType() {
        return this.#furnitureType;
    }

    getMode() {
        return this.#mode;
    }

    getCurrentLayer() {
        return this.#currentLayer;
    }

    getVertex(pixelsX, pixelsY) {
        const [unitsX, unitsY] = this.#currentLayer.pixelsToUnits(pixelsX, pixelsY);

        return this.#currentLayer.getVertex(unitsX, unitsY);
    }

    getVertexAtMouse() {
        const [pixelsX, pixelsY] = this.getMouseCoords();

        return this.getVertex(pixelsX, pixelsY);
    }

    getEdgeAtMouse() {
        const [pixelsX, pixelsY] = this.getMouseCoords();
        const [edge, dist, x, y] = this.getEdge(pixelsX, pixelsY);

        return edge;
    }

    getEdge(pixelsX, pixelsY) {
        const [unitsX, unitsY] = this.#currentLayer.pixelsToUnits(pixelsX, pixelsY);

        return this.#currentLayer.getEdge(unitsX, unitsY);
    }

    getKeyStr() {
        const keys = [...this.#keysDown];

        keys.sort((a, b) => {
            const aIndex = modifierOrder.indexOf(a);
            const bIndex = modifierOrder.indexOf(b);

            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;

            return aIndex - bIndex;
        });

        return keys.join('+');
    }

    selectVertex(vert) {
        this.selectedVertices.add(vert);
        vert.setSelected(true);
    }

    deselectVertex(vert) {
        if (!this.selectedVertices.delete(vert)) return;

        vert.setSelected(false);
    }

    clearSelectedVertices() {
        for (const vert of [...this.selectedVertices])
            this.deselectVertex(vert);
    }

    selectEdge(edge) {
        this.selectedEdges.add(edge);

        const line = edge.getLine();
        line.setAttribute("stroke", "#298dff");
        line.setAttribute("stroke-width", 3);
    }

    deselectEdge(edge) {
        if (!this.selectedEdges.delete(edge)) return;

        const line = edge.getLine();
        line.setAttribute("stroke", "#b4b4b4");
        line.setAttribute("stroke-width", 2);
    }

    clearSelectedEdges() {
        for (const edge of [...this.selectedEdges])
            this.deselectEdge(edge);
    }

    clearSelection() {
        this.clearSelectedVertices();
        this.clearSelectedEdges();
    }

    selectAtMouse(additive) {
        if (this.#mode == 'edge') {
            if (!additive)
                this.clearSelection();

            const edge = this.getEdgeAtMouse();
            if (edge == null) return;

            if (additive && this.selectedEdges.has(edge))
                this.deselectEdge(edge);
            else
                this.selectEdge(edge);

            return;
        }

        const vert = this.getVertexAtMouse();

        if (additive) {
            if (vert == null) return;

            if (this.selectedVertices.has(vert))
                this.deselectVertex(vert);
            else
                this.selectVertex(vert);

            return;
        }

        if (vert == null) {
            this.clearSelection();
            return;
        }

        if (!this.selectedVertices.has(vert)) {
            this.clearSelection();
            this.selectVertex(vert);
        }

        this.startDrag();
    }

    rotateSelectedFurniture(degrees) {
        for (const vert of this.selectedVertices) {
            if (vert.canRotate())
                vert.rotate(degrees);
        }
    }

    startDrag() {
        if (this.selectedVertices.size === 0) return;

        const [pixelsX, pixelsY] = this.getMouseCoords();
        const [unitsX, unitsY] = this.#currentLayer.pixelsToUnits(pixelsX, pixelsY);
        const origins = new Map();

        for (const vert of this.selectedVertices)
            origins.set(vert, vert.getCoords());

        this.#drag = { unitsX, unitsY, origins };
    }

    updateDrag() {
        if (this.#drag == null) return;

        const [pixelsX, pixelsY] = this.getMouseCoords();
        const [unitsX, unitsY] = this.#currentLayer.pixelsToUnits(pixelsX, pixelsY);
        const [deltaX, deltaY] = this.#currentLayer.snapToGrid(
            unitsX - this.#drag.unitsX,
            unitsY - this.#drag.unitsY
        );

        for (const [vert, [startX, startY]] of this.#drag.origins)
            vert.moveTo(startX + deltaX, startY + deltaY);
    }

    endDrag() {
        this.#drag = null;
    }

    createLayer() {
        const l = new layer();
        this.#layers.push(l);

        return l;
    }

    createKeybind(keyStr, downFunc, upFunc) {
        this.#keybinds.set(keyStr, new keybind(keyStr, downFunc, upFunc, this));
    }

    #normalizeKey(key) {
        if (key.length === 1)
            return key.toLowerCase();

        return key;
    }

    keyDown(key) {
        key = this.#normalizeKey(key);

        if (this.#keysDown.has(key)) return;

        this.#keysDown.add(key);

        if (modifierKeys.has(key)) return;

        const kb = this.#keybinds.get(this.getKeyStr());

        if (kb != null) {
            this.#activeKeybinds.set(key, kb);
            kb.down();
        }
    }

    keyUp(key) {
        key = this.#normalizeKey(key);

        const kb = this.#activeKeybinds.get(key);

        if (kb != null) {
            kb.up();
            this.#activeKeybinds.delete(key);
        }

        this.#keysDown.delete(key);
    }

    getMouseCoords() {
        return [this.#mouseX, this.#mouseY];
    }

    zoomIn(center = false) {
        this.endDrag();

        const [x, y] = this.#getZoomCenter(center);
        this.#currentLayer.zoomAt(x, y, 1.2);

        if (this.#mouseMoved)
            this.#previewLayer.updatePreview(this.#mouseX, this.#mouseY);
    }

    zoomOut(center = false) {
        this.endDrag();

        const [x, y] = this.#getZoomCenter(center);
        this.#currentLayer.zoomAt(x, y, 1 / 1.2);

        if (this.#mouseMoved)
            this.#previewLayer.updatePreview(this.#mouseX, this.#mouseY);
    }

    resetZoom() {
        this.endDrag();
        this.#currentLayer.resetView();

        if (this.#mouseMoved)
            this.#previewLayer.updatePreview(this.#mouseX, this.#mouseY);
    }
}
