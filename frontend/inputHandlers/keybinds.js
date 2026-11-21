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
    }
}
