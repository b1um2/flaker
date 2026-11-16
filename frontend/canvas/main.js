import { app } from './app.js';
import { keybinds } from '../inputHandlers/keybinds.js';
import { furnitureTypes } from '../workspaceElements/furnitureTypes.js';

const application = new app();

const layer = application.createLayer();
application.setCurrentLayer(layer);
layer.resetView();

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

application.setFurnitureType(Object.keys(furnitureTypes)[0]);
application.setMode('vertex');
