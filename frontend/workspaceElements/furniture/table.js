import { furnitureVertex } from '../furnitureVertex.js';
import { furnitureSizes } from './sizes.js';

export class table extends furnitureVertex {
    constructor(x, y, parentLayer) {
        const size = furnitureSizes.table;

        super(x, y, parentLayer, size.width, size.height);

        this.getOutline().setAttribute("fill", "#4a3f35");
        this.getOutline().setAttribute("rx", 4);

        const [width, height] = this.getPixelSize();
        const inset = Math.min(width, height) * 0.15;

        this.addRect(-width / 2 + inset, -height / 2 + inset, width - 2 * inset, height - 2 * inset, "#5a4d41", 2);
    }
}
