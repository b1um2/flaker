export class keybind {
    #keyStr;
    #downFunc;
    #upFunc;
    #keyManager;

    constructor(keyStr, downFunc, upFunc, keyManager) {
        this.#keyStr = keyStr;

        this.#downFunc = downFunc;
        this.#upFunc = upFunc;
        this.#keyManager = keyManager;
    }

    down() {
        if (this.#downFunc)
            this.#downFunc(this.#keyManager);
    }

    up() {
        if (this.#upFunc)
            this.#upFunc(this.#keyManager);
    }
}