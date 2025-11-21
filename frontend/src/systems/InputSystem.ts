import { AXISES, TRIGGERS } from "@/config/inputs";
import { lerp } from "three/src/math/MathUtils.js";

class CInputSystem {
    private keysDown: Set<number>;
    private keysPressed: Set<number>;
    private keysUp: Set<number>;

    private axisesRaw: Map<string, number>;
    private axises: Map<string, number>;
    private triggers: Map<string, number[]>;

    constructor() {
        this.keysDown = new Set();
        this.keysPressed = new Set();
        this.keysUp = new Set();

        this.axisesRaw = new Map();
        this.axises = new Map();
        this.triggers = new Map(TRIGGERS.map(({ name, key }) => [name, key]));

        if (typeof window !== "undefined") {
            // Client-side-only code
            this.enable();
        }
    }

    enable = () => {
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
    };
    disable = () => {
        window.removeEventListener("keydown", this.onKeyDown.bind(this));
        window.removeEventListener("keyup", this.onKeyUp.bind(this));
    };

    private onKeyDown = ({ which }: KeyboardEvent) => {
        if (!this.keysPressed.has(which)) {
            this.keysDown.add(which);
        }
    };

    private onKeyUp = ({ which }: KeyboardEvent) => {
        this.keysPressed.delete(which);

        this.keysUp.add(which);
    };

    firstUpdate = () => {
        // Axises value
        const smoothnessMap: Record<string, number> = {};
        for (const { name, negative, positive, smoothness } of AXISES) {
            this.axisesRaw.set(
                name,
                +positive.some((key) => this.keysPressed.has(key)) +
                -negative.some((key) => this.keysPressed.has(key))
            );

            smoothnessMap[name] = smoothness ?? 0.5;
        }

        // Lerp axises
        for (const [key, value] of this.axisesRaw) {
            this.axises.set(
                key,
                lerp(this.axises.get(key) ?? 0, value, smoothnessMap[key])
            );
        }
    };

    lastUpdate = () => {
        for (const down of this.keysDown) {
            this.keysPressed.add(down);
        }

        this.keysDown.clear();
        this.keysUp.clear();
    };

    isKeyDown = (key: number) => {
        return this.keysDown.has(key);
    };

    isKeyPressed = (key: number) => {
        return this.keysPressed.has(key);
    };

    isKeyUp = (key: number) => {
        return this.keysUp.has(key);
    };

    getAxis = <T extends string>(
        keys: T[],
        multiplyScalar: number = 1
    ): Record<T, number> => {
        // @ts-ignore
        return Object.fromEntries(
            keys.map((key) => [key, this.axises.get(key)! * multiplyScalar])
        );
    };

    getAxisRaw = <T extends string>(
        keys: T[],
        multiplyScalar: number = 1
    ): Record<T, number> => {
        // @ts-ignore
        return Object.fromEntries(
            keys.map((key) => [key, this.axisesRaw.get(key)! * multiplyScalar])
        );
    };

    onTriggerDown = (key: string): boolean => {
        const keys = this.triggers.get(key) ?? [];

        return keys.some(this.isKeyDown);
    };

    onTriggerPressed = (key: string): boolean => {
        const keys = this.triggers.get(key) ?? [];

        return keys.some(this.isKeyPressed);
    };

    onTriggerUp = (key: string): boolean => {
        const keys = this.triggers.get(key) ?? [];

        return keys.some(this.isKeyUp);
    };
}

export const InputSystem = new CInputSystem();
(globalThis as any).InputSystem = InputSystem;
