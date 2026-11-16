export class vertexSpatialHashgrid {
    #cellSize;
    #grid;

    constructor(cellSize = 5) {
        this.#cellSize = cellSize;
        this.#grid = new Map();
    }

    #getCellKey(cellX, cellY) {
        return `${cellX},${cellY}`;
    }

    #getCellCoords(x, y) {
        return [
            Math.floor(x / this.#cellSize),
            Math.floor(y / this.#cellSize)
        ];
    }

    getCellSize() {
        return this.#cellSize;
    }

    insert(vertex) {
        const [x, y] = vertex.getCoords();
        const [cellX, cellY] = this.#getCellCoords(x, y);
        const key = this.#getCellKey(cellX, cellY);

        if (!this.#grid.has(key)) 
            this.#grid.set(key, new Set());

        this.#grid.get(key).add(vertex);
    }

    remove(vertex) {
        const [x, y] = vertex.getCoords();
        const [cellX, cellY] = this.#getCellCoords(x, y);
        const key = this.#getCellKey(cellX, cellY);
        const cell = this.#grid.get(key);

        if (cell) {
            cell.delete(vertex);
            if (cell.size === 0) 
                this.#grid.delete(key);
        }
    }

    update(vertex, newX, newY) {
        const [x, y] = vertex.getCoords();
        const [oldCellX, oldCellY] = this.#getCellCoords(x, y);
        const [newCellX, newCellY] = this.#getCellCoords(newX, newY);
        const oldKey = this.#getCellKey(oldCellX, oldCellY);
        const newKey = this.#getCellKey(newCellX, newCellY);

        if (oldKey === newKey) return;

        const oldCell = this.#grid.get(oldKey);

        if (oldCell) {
            oldCell.delete(vertex);
            if (oldCell.size === 0)
                this.#grid.delete(oldKey);
        }

        if (!this.#grid.has(newKey))
            this.#grid.set(newKey, new Set());

        this.#grid.get(newKey).add(vertex);
    }

    // finds vertices in the target cell and its immediate 8 neighbors
    getNearby(x, y) {
        const vertices = new Set();
        const [baseCellX, baseCellY] = this.#getCellCoords(x, y);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = this.#getCellKey(baseCellX + dx, baseCellY + dy);
                const cell = this.#grid.get(key);

                if (cell) {
                    for (const vertex of cell)
                        vertices.add(vertex);
                }
            }
        }

        return [...vertices];
    }
}
