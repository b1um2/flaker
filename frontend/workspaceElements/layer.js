import { vertex } from './vertex.js';
import { edge } from './edge.js';
import { edgeVertex } from './edgeVertex.js';
import { vertexSpatialHashgrid } from '../dataStructures/vertexSpatialHashGrid.js';
import { edgeSpatialHashgrid } from '../dataStructures/edgeSpatialHashGrid.js';
import { svgMapHolder, canvas } from '../dataStructures/utils.js';
import { vector2 } from '../dataStructures/vector2.js';

export class layer {
    static #vertexCount;
    static #layers = [];
    static #pixelsPerUnit = new vector2(40, 40);
    static #unitOriginPosition = new vector2(0, 0); //where the origin is in the viewport (in pixels)
    static #clickRadius = 1;

    #vertexSpatialHashgrid = new vertexSpatialHashgrid();
    #edgeSpatialHashgrid = new edgeSpatialHashgrid();
    #vertexIds = new Map();
    #vertexRadius = 4;
    #gridSize = new vector2(1, 1); //the grid size in units

    constructor() {
        layer.#layers.push(this);
    }

    getGridSize() {
        return this.#gridSize;
    }

    getVertexRadius() {
        return this.#vertexRadius;
    }

    getVertex(x, y) {
        return this.#vertexSpatialHashgrid.getNearest(x, y, layer.#clickRadius);
    }

    getEdge(x, y) {
        return this.#edgeSpatialHashgrid.getNearest(x, y, layer.#clickRadius);
    }

    snapToGrid(unitsX, unitsY) {
        const [gridX, gridY] = this.#gridSize.getCoords();

        return [
                Math.round(unitsX/gridX)*gridX, 
                Math.round(unitsY/gridY)*gridY
            ];
    }

    pixelsToUnits(pixelsX, pixelsY) {
        const [pixelsPerUnitX, pixelsPerUnitY] = layer.#pixelsPerUnit.getCoords();
        const [unitOriginPositionX, unitOriginPositionY] = layer.#unitOriginPosition.getCoords();

        return [
                (pixelsX-unitOriginPositionX)/pixelsPerUnitX,
                (pixelsY-unitOriginPositionY)/pixelsPerUnitY
            ];
    }

    unitsToPixels(unitsX, unitsY) {
        const [pixelsPerUnitX, pixelsPerUnitY] = layer.#pixelsPerUnit.getCoords();
        const [unitOriginPositionX, unitOriginPositionY] = layer.#unitOriginPosition.getCoords();

        return [
                unitsX*pixelsPerUnitX + unitOriginPositionX,
                unitsY*pixelsPerUnitY + unitOriginPositionY
            ];
    }

    pixelsToSnappedPixels(pixelsX, pixelsY) {
        const [unitX, unitY] = this.pixelsToUnits(pixelsX, pixelsY);
        const [snappedUnitX, snappedUnitY] = this.snapToGrid(unitX, unitY);
        return this.unitsToPixels(snappedUnitX, snappedUnitY);
    }

    pixelsToSnappedUnits(pixelsX, pixelsY) {
        const [unitX, unitY] = this.pixelsToUnits(pixelsX, pixelsY);
        return this.snapToGrid(unitX, unitY);
    }

    createVertexFromPixelPos(pixelsX, pixelsY) {
        const [unitsX, unitsY] = this.pixelsToSnappedUnits(pixelsX, pixelsY)
        return this.createVertex(unitsX, unitsY);
    }

    createEdgeVertex(unitsX, unitsY, edge) {
        const vert = new edgeVertex(unitsX, unitsY, 2, edge, this);
        
        this.appendVertex(vert);
        layer.#vertexCount++;

        return vert;
    }

    createVertex(unitsX, unitsY) {
        const [snappedX, snappedY] = this.snapToGrid(unitsX, unitsY)
        const vert = new vertex(snappedX, snappedY, this);

        this.appendVertex(vert);
        layer.#vertexCount++;

        return vert;
    }

    appendVertex(vert) {
        this.#vertexSpatialHashgrid.insert(vert);
    }

    removeVertex(vert) {
        this.#vertexSpatialHashgrid.remove(vert);
    }

    createEdge(vertex1, vertex2) {
        const e = new edge(vertex1, vertex2, this);
        this.#edgeSpatialHashgrid.insert(e);

        return e;
    }

    deleteEdge(e) {
        this.#edgeSpatialHashgrid.remove(e);
    }
}