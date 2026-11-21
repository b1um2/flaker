import { commonKeybinds, commonLegend } from './commonKeybinds.js';

export const vertexKeybinds = {
    ...commonKeybinds,

    spawn : {
        key : ['e'],

        downFunc : (app) => {
            const currentLayer = app.getCurrentLayer();
            const [mouseX, mouseY] = app.getMouseCoords();

            currentLayer.createVertexFromPixelPos(mouseX, mouseY);
        }
    },

    connect : {
        key : ['f'],

        downFunc : (app) => {
            const currentLayer = app.getCurrentLayer();

            let vert1 = null;

            for (const vert2 of app.selectedVertices) {
                if (!vert2.canConnect()) continue;

                if (vert1 != null)
                    currentLayer.createEdge(vert1, vert2);

                vert1 = vert2;
            }
        }
    }
};

export const vertexLegend = [
    { keys : ['E'], label : 'place vertex' },
    { keys : ['F'], label : 'connect' },
    ...commonLegend
];
