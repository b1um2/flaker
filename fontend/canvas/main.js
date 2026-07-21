import { app } from './app.js';
import { keybinds } from '../inputHandlers/keybinds.js';

const application = new app();

const layer = application.createLayer();
application.setCurrentLayer(layer);

for (const actionName in keybinds) {
    const info = keybinds[actionName];
    for (let i=0; i < info.key.length; i++) {
        application.createKeybind(info.key[i], info.downFunc, info.upFunc);
    }
}