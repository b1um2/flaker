import { furnitureVertex } from '../furnitureVertex.js';

export class bed extends furnitureVertex {
    constructor(x, y, parentLayer) {
        super(x, y, parentLayer, 1.6, 2.1);

        this.getOutline().setAttribute("fill", "#4b5560");
        this.getOutline().setAttribute("rx", 5);

        const [width, height] = this.getPixelSize();

        this.addRect(-width / 2 + 6, -height / 2 + 6, width - 12, 12, "#697784", 3);
        this.addRect(-width / 2 + 6, -height / 2 + 22, width - 12, height - 28, "#3e4852", 3);
    }
}
