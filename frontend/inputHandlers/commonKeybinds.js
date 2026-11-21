export const commonKeybinds = {
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
};

export const commonLegend = [
    { keys : ['Click'], label : 'select' },
    { keys : ['Shift+Click'], label : 'multi-select' },
    { keys : ['Del'], label : 'remove' },
    { keys : ['Esc'], label : 'clear' }
];
