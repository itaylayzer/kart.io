export class RandomCode {
    static set: Set<string>;
    static instance: RandomCode;

    static {
        this.set = new Set();
    }

    constructor() {
        if (RandomCode.instance === undefined) RandomCode.instance = this;
    }
    private generateCode() {
        const characters = "abcdefghijklmnopqrstuvwxyz";
        let result = "";

        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }

        return result;
    }
    generate() {
        let generatedCode = this.generateCode();

        while (RandomCode.set.has(generatedCode)) {
            generatedCode = this.generateCode();
        }

        return generatedCode;
    }
    release(code: string) {
        RandomCode.set.delete(code);
    }
}
