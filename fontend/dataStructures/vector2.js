export class vector2 {
    #x = 0;
    #y = 0;

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    getCoords() {
        return [this.#x, this.#y];
    }

    add(vector) {
        const [x, y] = vector.getCoords();

        return new vector2(x+this.#x, y+this.#y);
    }

    sub(vector) {
        const [x, y] = vector.getCoords();

        return new vector2(this.#x-x, this.#y-y);
    }

    dot(vector) {
        const [x, y] = vector.getCoords();

        return this.#x*x + this.#y*y;
    }

    cross(vector) {
        const [x, y] = vector.getCoords();

        return this.#x*y + this.#y*x;
    }

    scalar(num) {
        return new vector2(this.#x*num, this.#y*num);
    }
}