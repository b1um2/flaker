import { commonKeybinds } from './commonKeybinds.js';

export const edgeKeybinds = {
    ...commonKeybinds
};

export const edgeLegend = [
    { keys : ['Click'], label : 'select wall' },
    { keys : ['Shift+Click'], label : 'multi-select' },
    { keys : ['Del'], label : 'remove' },
    { keys : ['Esc'], label : 'clear' }
];
