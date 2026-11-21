import { keybind } from '../inputHandlers/keybind.js';
import { layer } from '../workspaceElements/layer.js';
import { previewLayer } from '../workspaceElements/previewLayer.js';
import { svgMapHolder } from '../dataStructures/utils.js';

const modifierOrder = ['Control', 'Shift', 'Alt', 'Meta'];
const modifierKeys = new Set(modifierOrder);
const minGridSize = 0.1;
const maxGridSize = 3;

export class app {
    #keybinds = new Map();
    #modeKeybinds = new Map();
    #modeKeybindSets = new Map();
    #boundMode = null;
    #keysDown = new Set();
    #activeKeybinds = new Map();
    #currentLayer;
    #previewLayer;
    #layers = [];
    #mode = 'vertex';
    #furnitureType = 'couch';
    #furnitureTypes = [];
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
            const target = ev.target;

            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'))
                return;

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
        return ev.target.closest("#tool-select, #furniture-menu, #keybind-panel, #keybind-open") != null;
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

        if (this.#boundMode !== mode) {
            this.#bindModeKeybinds(mode);
            this.#boundMode = mode;
        }

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

    registerFurnitureTypes(types) {
        this.#furnitureTypes = types;
    }

    cycleFurnitureType(step) {
        if (this.#furnitureTypes.length === 0) return;

        let index = this.#furnitureTypes.indexOf(this.#furnitureType);

        if (index === -1)
            index = 0;

        const nextIndex = (index + step + this.#furnitureTypes.length) % this.#furnitureTypes.length;

        this.setFurnitureType(this.#furnitureTypes[nextIndex]);
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
        if (this.#drag != null)
            this.#drag.collapseVert = null;

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

        const collapseVert = this.selectedVertices.size > 1 ? vert : null;

        this.startDrag(collapseVert);
    }

    rotateSelectedFurniture(degrees) {
        for (const vert of this.selectedVertices) {
            if (vert.canRotate())
                vert.rotate(degrees);
        }
    }

    resizeSelectedFurniture(step) {
        for (const vert of this.selectedVertices) {
            if (vert.canResize())
                vert.resize(step);
        }
    }

    setGridSize(units) {
        const value = Number(units);

        if (!Number.isFinite(value) || value <= 0) return;

        const gridSize = Math.min(maxGridSize, Math.max(minGridSize, value));

        layer.setGridSize(gridSize);

        const slider = document.getElementById("grid-size-slider");
        if (slider) slider.value = gridSize;

        const input = document.getElementById("grid-size-input");
        if (input) input.value = gridSize;

        if (this.#mouseMoved)
            this.#previewLayer.updatePreview(this.#mouseX, this.#mouseY);
    }

    startDrag(collapseVert = null) {
        if (this.selectedVertices.size === 0) return;

        const [pixelsX, pixelsY] = this.getMouseCoords();
        const [unitsX, unitsY] = this.#currentLayer.pixelsToUnits(pixelsX, pixelsY);
        const origins = new Map();

        for (const vert of this.selectedVertices)
            origins.set(vert, vert.getCoords());

        this.#drag = { unitsX, unitsY, origins, collapseVert };
    }

    updateDrag() {
        if (this.#drag == null) return;

        const [pixelsX, pixelsY] = this.getMouseCoords();
        const [unitsX, unitsY] = this.#currentLayer.pixelsToUnits(pixelsX, pixelsY);
        const [deltaX, deltaY] = this.#currentLayer.snapToGrid(
            unitsX - this.#drag.unitsX,
            unitsY - this.#drag.unitsY
        );

        if (deltaX !== 0 || deltaY !== 0)
            this.#drag.collapseVert = null;

        for (const [vert, [startX, startY]] of this.#drag.origins)
            vert.moveTo(startX + deltaX, startY + deltaY);
    }

    endDrag() {
        const drag = this.#drag;
        this.#drag = null;

        if (drag == null || drag.collapseVert == null) return;

        const vert = drag.collapseVert;

        this.clearSelection();
        this.selectVertex(vert);
    }

    createLayer() {
        const l = new layer();
        this.#layers.push(l);

        return l;
    }

    createKeybind(keyStr, downFunc, upFunc) {
        this.#keybinds.set(keyStr, new keybind(keyStr, downFunc, upFunc, this));
    }

    registerModeKeybinds(mode, keybinds, legend) {
        this.#modeKeybindSets.set(mode, { keybinds: keybinds, legend: legend });
    }

    #bindModeKeybinds(mode) {
        this.#modeKeybinds.clear();
        this.#activeKeybinds.clear();
        this.endDrag();

        const info = this.#modeKeybindSets.get(mode);

        if (info != null) {
            for (const actionName in info.keybinds) {
                const action = info.keybinds[actionName];

                for (const keyStr of action.key)
                    this.#modeKeybinds.set(keyStr, new keybind(keyStr, action.downFunc, action.upFunc, this));
            }
        }

        this.#renderKeybindLegend(info ? info.legend : []);
    }

    #renderKeybindLegend(rows) {
        const panel = document.getElementById("keybind-panel-content");
        if (panel == null) return;

        panel.textContent = "";

        for (const row of rows) {
            const rowElement = document.createElement("div");
            rowElement.className = "keybind-row";

            const keysElement = document.createElement("span");
            keysElement.className = "keybind-keys";

            for (const key of row.keys) {
                const keyElement = document.createElement("kbd");
                keyElement.textContent = key;
                keysElement.appendChild(keyElement);
            }

            const labelElement = document.createElement("span");
            labelElement.className = "keybind-label";
            labelElement.textContent = row.label;

            rowElement.appendChild(keysElement);
            rowElement.appendChild(labelElement);
            panel.appendChild(rowElement);
        }
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

        const keyStr = this.getKeyStr();
        const kb = this.#modeKeybinds.get(keyStr) ?? this.#keybinds.get(keyStr);

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
