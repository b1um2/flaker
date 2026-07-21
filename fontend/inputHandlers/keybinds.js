export const keybinds = {
    spawn : {
        key : ['e'],

        upFunc : (app) => {
            const currentLayer = app.getCurrentLayer();
            const [x, y] = app.getMouseCoords()
            currentLayer.createVertexFromPixelPos(x, y);
        },

        downFunc : (app) => {

        }
    },

    select : {
        key : ['Mouse1'],

        upFunc : (app) => {
            const currentLayer = app.getCurrentLayer();
            const [x, y] = app.getMouseCoords()
            const [unitsX, unitsY] = currentLayer.pixelsToUnits(x, y);
            const vert = currentLayer.getVertex(unitsX, unitsY);

            app.clearSelectedVertices();
            if (vert)
                app.selectVertex(vert);
            
            console.log(app.selectedVertices);
        },

        downFunc : (app) => {

        }
    },

    multiSelect : {
        key : ['Control+Mouse1', 'Shift+Mouse1'],

        upFunc : (app) => {
            const currentLayer = app.getCurrentLayer();
            const [x, y] = app.getMouseCoords()
            const [unitsX, unitsY] = currentLayer.pixelsToUnits(x, y);
            const vert = currentLayer.getVertex(unitsX, unitsY);

            if (vert)
                app.selectVertex(vert);
            
            console.log(app.selectedVertices);
        },

        downFunc : (app) => {

        }
    },

    connect : {
        key : ['f'],

        upFunc : (app) => {
            const currentLayer = app.getCurrentLayer();

            let vert1 = null;

            for (const vert2 of app.selectedVertices) {
                if (vert1 != null)
                    currentLayer.createEdge(vert1, vert2);

                vert1 = vert2;
            }
        },

        downFunc : (app) => {

        }
    },

    delete : {
        key : ['Delete'],

        upFunc : (app) => {
            const currentLayer = app.getCurrentLayer();

            for (const vert of app.selectedVertices) {
                vert.destroy();

                if (app.selectedVertices.has(vert))
                    app.unselectedVertex(vert);
            }
        },

        downFunc : (app) => {

        }
    }
}