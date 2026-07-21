import { vertex } from './vertex.js';
import { edge } from './edge.js';
import { spatialHashgrid } from '../dataStructures/spatialHashGrid.js';
import { svgMapHolder, canvas } from '../dataStructures/utils.js';
import { vector2 } from '../dataStructures/vector2.js';

export class layer {
    static #vertexCount;
    static #layers = [];
    static #pixelsPerUnit = new vector2(60, 60);
    static #unitOriginPosition = new vector2(0, 0); //where the origin is in the viewport (in pixels)
    static #clickRadius = 1;

    #vertexSpatialHashgrid;
    #edgeSpatialHashgrid;
    #vertexIds;
    #vertexRadius = 4;
    #gridSize = new vector2(1, 1); //the grid size in units

    constructor() {
        layer.#layers.push(this);
        this.#vertexSpatialHashgrid = new spatialHashgrid();
        this.#edgeSpatialHashgrid = new spatialHashgrid();
        this.#vertexIds = new Map();
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
        const vert = new vertex(unitsX, unitsY, this);

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
    }

    deleteEdge(vertex1, vertex2) {
        
    }

    getEdgeGrids(vert1, vert2) { //runs dda algorithm to store the edge in every grid square it passes through
        const [x0, y0] = vert1.getCoords();
        const [x1, y1] = vert2.getCoords();
        const cellSize = this.#edgeSpatialHashgrid.getCellSize();

        let cellX = Math.floor(x0 / cellSize);
        let cellY = Math.floor(y0 / cellSize);
        const endCellX = Math.floor(x1 / cellSize);
        const endCellY = Math.floor(y1 / cellSize);

        const dx = x1 - x0;
        const dy = y1 - y0;

        const stepX = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
        const stepY = dy > 0 ? 1 : (dy < 0 ? -1 : 0);

        const tDeltaX = dx !== 0 ? Math.abs(cellSize / dx) : Infinity;
        const tDeltaY = dy !== 0 ? Math.abs(cellSize / dy) : Infinity;

        const nextBoundaryX = stepX > 0 ? (cellX + 1) * cellSize : cellX * cellSize;
        const nextBoundaryY = stepY > 0 ? (cellY + 1) * cellSize : cellY * cellSize;

        let tMaxX = dx !== 0 ? (nextBoundaryX - x0) / dx : Infinity;
        let tMaxY = dy !== 0 ? (nextBoundaryY - y0) / dy : Infinity;

        const cells = [[cellX, cellY]];
        const maxSteps = Math.abs(endCellX - cellX) + Math.abs(endCellY - cellY) + 2;
        let steps = 0;

        while ((cellX !== endCellX || cellY !== endCellY) && steps < maxSteps) {
            if (tMaxX < tMaxY) {
                tMaxX += tDeltaX;
                cellX += stepX;
            } else {
                tMaxY += tDeltaY;
                cellY += stepY;
            }
            cells.push([cellX, cellY]);
            steps++;
        }

        return cells;
    }

    getEdge(x, y) {
        const nearby = this.#edgeSpatialHashgrid.getNearby(x, y);
        const candidateEdges = new Set();
        for (const entry of nearby) {
            candidateEdges.add(entry.edge);
        }

        let closestEdge = null;
        let xCoord = null;
        let yCoord = null;
        let closestDist = Infinity;

        for (const candidateEdge of candidateEdges) {
            const [x, y, dist] = this.getNearestPointOnEdge(x, y, candidateEdge);
            if (dist < closestDist) {
                closestDist = dist;
                closestEdge = candidateEdge;
                xCoord = x;
                yCoord = y;
            }
        }

        return [closestEdge, closestDist, xCoord, yCoord];
    }

    getNearestPointOnEdge(unitX, unitY, edge) {
        const [vertex1, vertex2] = edge.getVertices();
        const [x1, y1] = vertex1.getCoords();
        const [x2, y2] = vertex2.getCoords();

        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx**2 + dy**2;

        let t = lengthSquared === 0
            ? 0
            : ((unitX - x1) * dx + (unitY - y1) * dy) / lengthSquared;

        t = Math.max(0, Math.min(1, t));

        const nearestX = x1 + t * dx;
        const nearestY = y1 + t * dy;
        const dist = Math.sqrt((unitX - nearestX) ** 2 + (unitY - nearestY) ** 2);

        return [nearestX, nearestY, dist];
    }
}