import { commonKeybinds, commonLegend } from './commonKeybinds.js';

const rotationStep = 45;
const resizeStep = 0.25;

export const furnitureKeybinds = {
    ...commonKeybinds,

    spawn : {
        key : ['e'],

        downFunc : (app) => {
            const currentLayer = app.getCurrentLayer();
            const [mouseX, mouseY] = app.getMouseCoords();

            currentLayer.createFurnitureFromPixelPos(app.getFurnitureType(), mouseX, mouseY);
        }
    },

    nextFurniture : {
        key : ['ArrowDown'],

        downFunc : (app) => {
            app.cycleFurnitureType(1);
        }
    },

    previousFurniture : {
        key : ['ArrowUp'],

        downFunc : (app) => {
            app.cycleFurnitureType(-1);
        }
    },

    rotate : {
        key : ['r'],

        downFunc : (app) => {
            app.rotateSelectedFurniture(rotationStep);
        }
    },

    rotateBack : {
        key : ['Shift+r'],

        downFunc : (app) => {
            app.rotateSelectedFurniture(-rotationStep);
        }
    },

    resize : {
        key : ['s'],

        downFunc : (app) => {
            app.resizeSelectedFurniture(resizeStep);
        }
    },

    resizeBack : {
        key : ['Shift+s'],

        downFunc : (app) => {
            app.resizeSelectedFurniture(-resizeStep);
        }
    }
};

export const furnitureLegend = [
    { keys : ['E'], label : 'place furniture' },
    { keys : ['↑', '↓'], label : 'cycle furniture' },
    { keys : ['R', 'Shift+R'], label : 'rotate' },
    { keys : ['S', 'Shift+S'], label : 'resize' },
    ...commonLegend
];
