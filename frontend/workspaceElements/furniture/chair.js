import { furnitureVertex } from '../furnitureVertex.js';
import { furnitureSizes } from './sizes.js';

export class chair extends furnitureVertex {
    constructor(x, y, parentLayer) {
        const size = furnitureSizes.chair;

        super(x, y, parentLayer, size.width, size.height);

        this.getOutline().setAttribute("fill", "#4f5a5f");
        this.getOutline().setAttribute("rx", 4);

        const [width, height] = this.getPixelSize();
        const pad = Math.min(width, height) * 0.13;
        const backHeight = height * 0.2;
        const seatY = -height / 2 + pad + backHeight + 2;
        const seatHeight = height - 2 * pad - backHeight - 2;

        this.addRect(-width / 2 + pad, -height / 2 + pad, width - 2 * pad, backHeight, "#5f6c72", 2);
        this.addRect(-width / 2 + pad, seatY, width - 2 * pad, seatHeight, "#455156", 2);
    }
}
