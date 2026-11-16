const rotationStep = 45;

export const keybinds = {
    vertexMode : {
        key : ['1'],

        downFunc : (app) => {
            app.setMode('vertex');
        }
    },

    edgeMode : {
        key : ['2'],

        downFunc : (app) => {
            app.setMode('edge');
        }
    },

    edgeVertexMode : {
        key : ['3'],

        downFunc : (app) => {
            app.setMode('edgeVertex');
        }
    },

    furnitureMode : {
        key : ['4'],

        downFunc : (app) => {
            app.setMode('furniture');
        }
    },

    rotateFurniture : {
        key : ['r'],

        downFunc : (app) => {
            app.rotateSelectedFurniture(rotationStep);
        }
    },

    rotateFurnitureBack : {
        key : ['Shift+r'],

        downFunc : (app) => {
            app.rotateSelectedFurniture(-rotationStep);
        }
    },

    spawn : {
        key : ['e'],

        downFunc : (app) => {
            const currentLayer = app.getCurrentLayer();
            const [mouseX, mouseY] = app.getMouseCoords();

            if (app.getMode() == 'vertex') {
                currentLayer.createVertexFromPixelPos(mouseX, mouseY);
            } else if (app.getMode() == 'edgeVertex') {
                const [edge, dist, x, y] = app.getEdge(mouseX, mouseY);

                if (edge != null)
                    currentLayer.createEdgeVertex(x, y, edge);
            } else if (app.getMode() == 'furniture') {
                currentLayer.createFurnitureFromPixelPos(app.getFurnitureType(), mouseX, mouseY);
            }
        }
    },

    select : {
        key : ['Mouse1'],

        downFunc : (app) => {
            app.selectAtMouse(false);
        },

        upFunc : (app) => {
            app.endDrag();
        }
    },

    multiSelect : {
        key : ['Control+Mouse1', 'Shift+Mouse1'],

        downFunc : (app) => {
            app.selectAtMouse(true);
        },

        upFunc : (app) => {
            app.endDrag();
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
    },

    delete : {
        key : ['Delete', 'Backspace'],

        downFunc : (app) => {
            const edges = [...app.selectedEdges];
            const verts = [...app.selectedVertices];

            app.clearSelection();

            for (const edge of edges)
                edge.destroy();

            for (const vert of verts)
                vert.destroy();
        }
    },

    cancel : {
        key : ['Escape'],

        downFunc : (app) => {
            app.clearSelection();
        }
    }
}
