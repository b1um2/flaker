export class edgeSpatialHashgrid {
    #cellSize;
    #grid;       // Map<cellKey, Set<edge>>
    #edgeCells;  // WeakMap<edge, Array<[cellX, cellY]>> - tracks which cells each edge occupies

    constructor(cellSize = 5) {
        this.#cellSize = cellSize;
        this.#grid = new Map();
        this.#edgeCells = new WeakMap();
    }

    #getCellKey(cellX, cellY) {
        return `${cellX},${cellY}`;
    }

    getCellSize() {
        return this.#cellSize;
    }

    // runs DDA algorithm to find every grid cell an edge passes through
    getEdgeGrids(vert1, vert2) {
        const [x0, y0] = vert1.getCoords();
        const [x1, y1] = vert2.getCoords();
        const cellSize = this.#cellSize;

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

    insert(edge) {
        const [vertex1, vertex2] = edge.getVertices();
        const cells = this.getEdgeGrids(vertex1, vertex2);

        for (const [cellX, cellY] of cells) {
            const key = this.#getCellKey(cellX, cellY);

            if (!this.#grid.has(key))
                this.#grid.set(key, new Set());

            this.#grid.get(key).add(edge);
        }

        this.#edgeCells.set(edge, cells);
    }

    remove(edge) {
        const cells = this.#edgeCells.get(edge);
        if (!cells) return;

        for (const [cellX, cellY] of cells) {
            const key = this.#getCellKey(cellX, cellY);
            const cell = this.#grid.get(key);

            if (cell) {
                cell.delete(edge);
                if (cell.size === 0)
                    this.#grid.delete(key);
            }
        }

        this.#edgeCells.delete(edge);
    }

    // call after the edge's vertex coordinates have changed
    update(edge) {
        this.remove(edge);
        this.insert(edge);
    }

    // finds edges in the target cell and its immediate 8 neighbors
    getNearby(x, y) {
        const edges = new Set();
        const cellSize = this.#cellSize;
        const baseCellX = Math.floor(x / cellSize);
        const baseCellY = Math.floor(y / cellSize);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = this.#getCellKey(baseCellX + dx, baseCellY + dy);
                const cell = this.#grid.get(key);

                if (cell) {
                    for (const edge of cell)
                        edges.add(edge);
                }
            }
        }

        return [...edges];
    }

    getNearestPointOnEdge(x, y, edge) {
        return edge.getNearestPoint(x, y);
    }

    getNearest(x, y, radius) {
        const candidateEdges = this.getNearby(x, y);

        let closestEdge = null;
        let xCoord = null;
        let yCoord = null;
        let closestDist = Infinity;

        for (const candidateEdge of candidateEdges) {
            const [nearX, nearY, dist] = this.getNearestPointOnEdge(x, y, candidateEdge);
            if (dist < closestDist) {
                closestDist = dist;
                closestEdge = candidateEdge;
                xCoord = nearX;
                yCoord = nearY;
            }
        }

        if (closestDist <= radius)
            return [closestEdge, closestDist, xCoord, yCoord];
        else
            return [null, null, null, null];
    }
}
