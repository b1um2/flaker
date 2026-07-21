export class vertexSpatialHashgrid {
    #cellSize;
    #grid;

    constructor(cellSize = 5) {
        this.#cellSize = cellSize;
        this.#grid = new Map();
    }

    #getCellKey(x, y) {
        const cellX = Math.floor(x / this.#cellSize);
        const cellY = Math.floor(y / this.#cellSize);

        return `${cellX},${cellY}`;
    }

    getCellSize() {
        return this.#cellSize;
    }

    insert(vertex) {
        const [x, y] = vertex.getCoords();
        const key = this.#getCellKey(x, y);

        if (!this.#grid.has(key)) 
            this.#grid.set(key, new Set());

        this.#grid.get(key).add(vertex);
    }

    remove(vertex) {
        const [x, y] = vertex.getCoords();
        const key = this.#getCellKey(x, y);
        const cell = this.#grid.get(key);

        if (cell) {
            cell.delete(vertex);
            if (cell.size === 0) 
                this.#grid.delete(key);
        }
    }

    update(vertex, newX, newY) {
        const [x, y] = vertex.getCoords();
        const oldKey = this.#getCellKey(x, y);
        const newKey = this.#getCellKey(newX, newY);

        if (oldKey !== newKey) {
            const oldCell = this.#grid.get(oldKey);

            if (oldCell) 
                oldCell.delete(vertex);
            
            if (!this.#grid.has(newKey)) 
                this.#grid.set(newKey, new Set());

            this.#grid.get(newKey).add(vertex);
        }
    }

    // finds vertices in the target cell and its immediate 8 neighbors
    getNearby(x, y) {
        let vertices = [];
        const cellSize = this.#cellSize;

        for (let dx = -cellSize; dx <= cellSize; dx+=cellSize) {
            for (let dy = -cellSize; dy <= cellSize; dy+=cellSize) {
                const key = this.#getCellKey(x+dx, y+dy);
                const cell = this.#grid.get(key);

                if (cell)
                    vertices = [...vertices, ...cell];
            }
        }
        
        return vertices;
    }

    getNearest(x, y, radius) {
        const vertices = this.getNearby(x, y);

        let closest = null;
        let closestDist = Infinity;

        for (let vertIndex = 0; vertIndex < vertices.length; vertIndex++) { //find the absolute closest vertex
            const [vertX, vertY] = vertices[vertIndex].getCoords();
            const dist = Math.sqrt((vertX - x)**2 + (vertY - y)**2);

            if (dist < closestDist) {
                closest = vertices[vertIndex];
                closestDist = dist;
            }
        }

        if (closestDist <= radius)  //check if within radius
            return closest;
        else
            return null;
    }
}