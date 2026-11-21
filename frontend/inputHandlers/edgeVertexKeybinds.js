import { commonKeybinds, commonLegend } from './commonKeybinds.js';

export const edgeVertexKeybinds = {
    ...commonKeybinds,

    spawn : {
        key : ['e'],

        downFunc : (app) => {
            const currentLayer = app.getCurrentLayer();
            const [mouseX, mouseY] = app.getMouseCoords();
            const [edge, dist, x, y] = app.getEdge(mouseX, mouseY);

            if (edge != null)
                currentLayer.createEdgeVertex(x, y, edge);
        }
    }
};

export const edgeVertexLegend = [
    { keys : ['E'], label : 'place door / window' },
    ...commonLegend
];
