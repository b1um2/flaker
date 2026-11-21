import { vertex } from './vertex.js';
import { edge } from './edge.js';
import { edgeVertex } from './edgeVertex.js';
import { furnitureTypes } from './furnitureTypes.js';
import { vertexSpatialHashgrid } from '../dataStructures/vertexSpatialHashGrid.js';
import { edgeSpatialHashgrid } from '../dataStructures/edgeSpatialHashGrid.js';
import { vector2 } from '../dataStructures/vector2.js';
import { worldGroup } from '../dataStructures/utils.js';

export class layer {
    static #pixelsPerUnit = new vector2(40, 40);
    static #unitOriginPosition = new vector2(0, 0); //where the origin is in the viewport (in pixels)
    static #edgeClickRadius = 0.6;

    // The view transform is applied to the SVG world group. World coordinates
    // (and therefore the spatial hash grids) never change when zooming/panning.
    static #viewScale = 1;
    static #viewOffsetX = 0;
    static #viewOffsetY = 0;
    static #minViewScale = 0.2;
    static #maxViewScale = 20;
    static #dotsElement = null;
    static #lastDotsTileSize = null;
    static #gridSize = new vector2(1, 1); //the grid size in units

    static getViewTransform() {
        return [layer.#viewScale, layer.#viewOffsetX, layer.#viewOffsetY];
    }

    static setViewTransform(scale, offsetX, offsetY) {
        layer.#viewScale = scale;
        layer.#viewOffsetX = offsetX;
        layer.#viewOffsetY = offsetY;
        layer.#applyViewTransform();
    }

    static setGridSize(units) {
        if (!Number.isFinite(units) || units <= 0) return;

        layer.#gridSize = new vector2(units, units);
        layer.#applyViewTransform();
    }

    static #applyViewTransform() {
        worldGroup.setAttribute(
            "transform",
            `translate(${layer.#viewOffsetX} ${layer.#viewOffsetY}) scale(${layer.#viewScale})`
        );

        if (layer.#dotsElement == null)
            layer.#dotsElement = document.querySelector(".tile-dots");

        const dots = layer.#dotsElement;
        if (dots == null) return;

        const [pixelsPerUnitX] = layer.#pixelsPerUnit.getCoords();
        const [gridX] = layer.#gridSize.getCoords();
        const tileSize = pixelsPerUnitX * gridX * layer.#viewScale;

        // Only rebuild the dot texture when the tile size actually changes;
        // panning just shifts the existing texture, which keeps dragging smooth.
        if (layer.#lastDotsTileSize !== tileSize) {
            layer.#lastDotsTileSize = tileSize;

            const dotRadius = Math.min(4, tileSize * 0.1);

            dots.style.backgroundImage =
                `radial-gradient(circle, rgba(255, 255, 255, 0.041) ${dotRadius}px, transparent ${dotRadius}px)`;
            dots.style.backgroundSize = `${tileSize}px ${tileSize}px`;
        }

        dots.style.backgroundPosition =
            `${layer.#viewOffsetX + tileSize / 2}px ${layer.#viewOffsetY + tileSize / 2}px`;
    }

    #vertexSpatialHashgrid = new vertexSpatialHashgrid();
    #edgeSpatialHashgrid = new edgeSpatialHashgrid();
    #edges = new Map();
    #vertexRadius = 4;

    getGridSize() {
        return layer.#gridSize;
    }

    getGridSizeUnits() {
        return layer.#gridSize.getCoords()[0];
    }

    getVertexRadius() {
        return this.#vertexRadius;
    }

    zoomAt(screenX, screenY, factor) {
        const [scale, offsetX, offsetY] = layer.getViewTransform();
        const newScale = Math.min(layer.#maxViewScale, Math.max(layer.#minViewScale, scale * factor));

        if (newScale === scale) return;

        const actualFactor = newScale / scale;

        layer.setViewTransform(
            newScale,
            screenX - (screenX - offsetX) * actualFactor,
            screenY - (screenY - offsetY) * actualFactor
        );
    }

    panBy(dx, dy) {
        const [scale, offsetX, offsetY] = layer.getViewTransform();
        layer.setViewTransform(scale, offsetX + dx, offsetY + dy);
    }

    resetView() {
        layer.setViewTransform(1, 0, 0);
    }

    getVertex(x, y) {
        return this.#findVertex(x, y);
    }

    #findVertex(x, y, radius) {
        const vertices = this.#vertexSpatialHashgrid.getNearby(x, y);

        let closest = null;
        let closestDist = Infinity;

        for (const vert of vertices) {
            const [vertX, vertY] = vert.getCoords();
            const dist = Math.sqrt((vertX - x) ** 2 + (vertY - y) ** 2);
            let hitRadius = radius;

            if (hitRadius == null) {
                hitRadius = vert.getHitRadius();

                // Point-like vertices keep a usable grab radius on screen while
                // still covering the drawn circle when zoomed in.
                if (vert.usesScreenSpaceHitRadius()) {
                    const [pixelsPerUnitX] = layer.#pixelsPerUnit.getCoords();
                    const screenMinHitRadius = 16;
                    const minHitRadiusInUnits = screenMinHitRadius / (pixelsPerUnitX * layer.#viewScale);
                    const vertexRadiusInUnits = this.getVertexRadius() / pixelsPerUnitX;

                    hitRadius = Math.max(minHitRadiusInUnits, vertexRadiusInUnits);
                }
            }

            if (dist <= hitRadius && dist < closestDist) {
                closest = vert;
                closestDist = dist;
            }
        }

        return closest;
    }

    #getVertexAt(x, y, radius) {
        return this.#findVertex(x, y, radius);
    }

    getEdge(x, y) {
        // Keep the clickable edge area constant on screen at any zoom level.
        const edgeHitRadius = layer.#edgeClickRadius / layer.#viewScale;

        return this.#edgeSpatialHashgrid.getNearest(x, y, edgeHitRadius);
    }

    snapToGrid(unitsX, unitsY) {
        const [gridX, gridY] = layer.#gridSize.getCoords();

        return [
                Math.round(unitsX/gridX)*gridX, 
                Math.round(unitsY/gridY)*gridY
            ];
    }

    pixelsToUnits(pixelsX, pixelsY) {
        const [pixelsPerUnitX, pixelsPerUnitY] = layer.#pixelsPerUnit.getCoords();
        const [unitOriginPositionX, unitOriginPositionY] = layer.#unitOriginPosition.getCoords();

        // Convert screen pixels back through the view transform first.
        const rawPixelsX = (pixelsX - layer.#viewOffsetX) / layer.#viewScale;
        const rawPixelsY = (pixelsY - layer.#viewOffsetY) / layer.#viewScale;

        return [
                (rawPixelsX-unitOriginPositionX)/pixelsPerUnitX,
                (rawPixelsY-unitOriginPositionY)/pixelsPerUnitY
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

    unitsToPixelsSize(unitsX, unitsY) {
        const [pixelsPerUnitX, pixelsPerUnitY] = layer.#pixelsPerUnit.getCoords();

        return [
                unitsX*pixelsPerUnitX,
                unitsY*pixelsPerUnitY
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
        const existing = this.#getVertexAt(unitsX, unitsY, 0.01);

        if (existing)
            return existing;

        const vert = new edgeVertex(unitsX, unitsY, 2, edge, this);
        
        this.appendVertex(vert);

        return vert;
    }

    createVertex(unitsX, unitsY) {
        const [snappedX, snappedY] = this.snapToGrid(unitsX, unitsY)
        const existing = this.#getVertexAt(snappedX, snappedY, 0.01);

        if (existing)
            return existing;

        const vert = new vertex(snappedX, snappedY, this);

        this.appendVertex(vert);

        return vert;
    }

    createFurnitureFromPixelPos(type, pixelsX, pixelsY) {
        const [unitsX, unitsY] = this.pixelsToSnappedUnits(pixelsX, pixelsY);
        return this.createFurniture(type, unitsX, unitsY);
    }

    createFurniture(type, unitsX, unitsY) {
        const info = furnitureTypes[type];
        if (info == null) return null;

        const [snappedX, snappedY] = this.snapToGrid(unitsX, unitsY);
        const existing = this.#getVertexAt(snappedX, snappedY, 0.01);

        if (existing)
            return existing;

        const vert = new info.furniture(snappedX, snappedY, this);

        this.appendVertex(vert);

        return vert;
    }

    appendVertex(vert) {
        this.#vertexSpatialHashgrid.insert(vert);
    }

    removeVertex(vert) {
        this.#vertexSpatialHashgrid.remove(vert);
    }

    updateVertex(vert, newX, newY) {
        this.#vertexSpatialHashgrid.update(vert, newX, newY);
    }

    createEdge(vertex1, vertex2) {
        if (vertex1 === vertex2) return null;
        if (!vertex1.canConnect() || !vertex2.canConnect()) return null;

        const id = edge.getUniqueId(vertex1, vertex2);
        const existing = this.#edges.get(id);

        if (existing)
            return existing;

        const e = new edge(vertex1, vertex2, this);
        this.#edges.set(id, e);
        this.#edgeSpatialHashgrid.insert(e);

        return e;
    }

    deleteEdge(e) {
        this.#edges.delete(e.getId());
        this.#edgeSpatialHashgrid.remove(e);
    }

    updateEdge(e) {
        this.#edgeSpatialHashgrid.update(e);
    }
}
