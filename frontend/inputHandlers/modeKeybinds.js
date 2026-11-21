import { vertexKeybinds, vertexLegend } from './vertexKeybinds.js';
import { edgeKeybinds, edgeLegend } from './edgeKeybinds.js';
import { edgeVertexKeybinds, edgeVertexLegend } from './edgeVertexKeybinds.js';
import { furnitureKeybinds, furnitureLegend } from './furnitureKeybinds.js';

export const modeKeybinds = {
    vertex: { keybinds: vertexKeybinds, legend: vertexLegend },
    edge: { keybinds: edgeKeybinds, legend: edgeLegend },
    edgeVertex: { keybinds: edgeVertexKeybinds, legend: edgeVertexLegend },
    furniture: { keybinds: furnitureKeybinds, legend: furnitureLegend }
};
