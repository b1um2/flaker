import { furnitureVertex } from '../furnitureVertex.js';

export class table extends furnitureVertex {
    constructor(x, y, parentLayer) {
        super(x, y, parentLayer, 1.8, 1.0);

        this.getOutline().setAttribute("fill", "#4a3f35");
        this.getOutline().setAttribute("rx", 4);

        const [width, height] = this.getPixelSize();

        this.addRect(-width / 2 + 6, -height / 2 + 6, width - 12, height - 12, "#5a4d41", 2);
    }
}
