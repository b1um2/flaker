import { furnitureVertex } from '../furnitureVertex.js';
import { furnitureSizes } from './sizes.js';

export class bed extends furnitureVertex {
    constructor(x, y, parentLayer) {
        const size = furnitureSizes.bed;

        super(x, y, parentLayer, size.width, size.height);

        this.getOutline().setAttribute("fill", "#4b5560");
        this.getOutline().setAttribute("rx", 5);

        const [width, height] = this.getPixelSize();
        const pad = Math.min(width, height) * 0.1;
        const pillowHeight = height * 0.15;
        const gap = 4;

        this.addRect(-width / 2 + pad, -height / 2 + pad, width - 2 * pad, pillowHeight, "#697784", 3);
        this.addRect(
            -width / 2 + pad,
            -height / 2 + pad + pillowHeight + gap,
            width - 2 * pad,
            height - 2 * pad - pillowHeight - gap,
            "#3e4852",
            3
        );
    }
}
