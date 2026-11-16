import { furnitureVertex } from '../furnitureVertex.js';

export class couch extends furnitureVertex {
    constructor(x, y, parentLayer) {
        super(x, y, parentLayer, 2.4, 1.2);

        this.getOutline().setAttribute("fill", "#46545a");
        this.getOutline().setAttribute("rx", 8);

        const [width, height] = this.getPixelSize();
        const cushionWidth = (width - 40) / 2;
        const cushionY = -4;
        const cushionHeight = height - 24;

        this.addRect(-width / 2 + 6, -height / 2 + 6, width - 12, 10, "#586a72", 4);
        this.addRect(-width / 2 + 6, -8, 8, height - 18, "#586a72", 3);
        this.addRect(width / 2 - 14, -8, 8, height - 18, "#586a72", 3);
        this.addRect(-width / 2 + 18, cushionY, cushionWidth, cushionHeight, "#3f4d53", 3);
        this.addRect(2, cushionY, cushionWidth, cushionHeight, "#3f4d53", 3);
    }
}
