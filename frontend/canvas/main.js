import { app } from './app.js';
import { keybinds } from '../inputHandlers/keybinds.js';
import { modeKeybinds } from '../inputHandlers/modeKeybinds.js';
import { furnitureTypes } from '../workspaceElements/furnitureTypes.js';

const application = new app();

const layer = application.createLayer();
application.setCurrentLayer(layer);
layer.resetView();

for (const [mode, info] of Object.entries(modeKeybinds)) {
    application.registerModeKeybinds(mode, info.keybinds, info.legend);
}

for (const actionName in keybinds) {
    const info = keybinds[actionName];
    for (const key of info.key) {
        application.createKeybind(key, info.downFunc, info.upFunc);
    }
}

for (const button of document.querySelectorAll("#tool-select button[data-mode]")) {
    button.addEventListener("click", () => {
        application.setMode(button.dataset.mode);
        button.blur();
    });
}

for (const [id, action] of [
    ["zoom-in", () => application.zoomIn(true)],
    ["zoom-out", () => application.zoomOut(true)],
    ["zoom-reset", () => application.resetZoom()],
]) {
    const button = document.getElementById(id);

    button.addEventListener("click", () => {
        action();
        button.blur();
    });
}

const furnitureList = document.getElementById("furniture-list");

for (const [type, info] of Object.entries(furnitureTypes)) {
    const button = document.createElement("button");

    button.type = "button";
    button.dataset.type = type;
    button.textContent = info.name;

    button.addEventListener("click", () => {
        application.setFurnitureType(type);
        button.blur();
    });

    furnitureList.appendChild(button);
}

application.registerFurnitureTypes(Object.keys(furnitureTypes));
application.setFurnitureType(Object.keys(furnitureTypes)[0]);

const gridSizeSlider = document.getElementById("grid-size-slider");
const gridSizeInput = document.getElementById("grid-size-input");

gridSizeSlider.addEventListener("input", () => {
    application.setGridSize(gridSizeSlider.value);
});

gridSizeInput.addEventListener("change", () => {
    application.setGridSize(gridSizeInput.value);
});

application.setGridSize(gridSizeInput.value);

const keybindPanel = document.getElementById("keybind-panel");
const keybindOpen = document.getElementById("keybind-open");
const keybindClose = document.getElementById("keybind-close");

function setKeybindPanelOpen(open) {
    keybindPanel.classList.toggle("open", open);
    keybindOpen.classList.toggle("visible", !open);
}

keybindClose.addEventListener("click", () => {
    setKeybindPanelOpen(false);
    keybindClose.blur();
});

keybindOpen.addEventListener("click", () => {
    setKeybindPanelOpen(true);
    keybindOpen.blur();
});

setKeybindPanelOpen(true);
application.setMode('vertex');
