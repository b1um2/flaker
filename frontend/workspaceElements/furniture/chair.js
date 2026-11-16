import { furnitureVertex } from '../furnitureVertex.js';

export class chair extends furnitureVertex {
    constructor(x, y, parentLayer) {
        super(x, y, parentLayer, 0.8, 0.8);

        this.getOutline().setAttribute("fill", "#4f5a5f");
        this.getOutline().setAttribute("rx", 4);

        this.addRect(-12, -12, 24, 6, "#5f6c72", 2);
        this.addRect(-12, -4, 24, 16, "#455156", 2);
    }
}
