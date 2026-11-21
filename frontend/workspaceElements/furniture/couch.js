import { furnitureVertex } from '../furnitureVertex.js';
import { furnitureSizes } from './sizes.js';

export class couch extends furnitureVertex {
    constructor(x, y, parentLayer) {
        const size = furnitureSizes.couch;

        super(x, y, parentLayer, size.width, size.height);

        this.getOutline().setAttribute("fill", "#46545a");
        this.getOutline().setAttribute("rx", 8);

        const [width, height] = this.getPixelSize();
        const pad = Math.min(width, height) * 0.12;
        const backHeight = height * 0.2;
        const armWidth = width * 0.1;
        const seatX = -width / 2 + pad + armWidth;
        const seatY = -height / 2 + pad + backHeight;
        const seatWidth = width - 2 * (pad + armWidth);
        const seatHeight = height - 2 * pad - backHeight;
        const cushionGap = pad * 0.5;
        const cushionWidth = (seatWidth - cushionGap) / 2;

        this.addRect(-width / 2 + pad, -height / 2 + pad, width - 2 * pad, backHeight, "#586a72", 3);
        this.addRect(-width / 2 + pad, seatY, armWidth, seatHeight, "#586a72", 3);
        this.addRect(width / 2 - pad - armWidth, seatY, armWidth, seatHeight, "#586a72", 3);
        this.addRect(seatX, seatY, cushionWidth, seatHeight, "#3f4d53", 3);
        this.addRect(seatX + cushionWidth + cushionGap, seatY, cushionWidth, seatHeight, "#3f4d53", 3);
    }
}
