import { Global } from "../store/Global";

export class MouseController {
    private _movement: [number, number];
    private mousePressed: Set<number>;
    private mouseDown: Set<number>;
    private mouseUp: Set<number>;
    constructor(enableOnStart: boolean = true) {
        this._movement = [0, 0];
        enableOnStart && this.enable();

        this.mouseDown = new Set();
        this.mousePressed = new Set();
        this.mouseUp = new Set();
    }

    public enable() {
        Global.renderer.domElement.addEventListener(
            "mousemove",
            this.onMouseMove.bind(this)
        );
        Global.renderer.domElement.addEventListener(
            "mousedown",
            this.onMouseDown.bind(this)
        );
        Global.renderer.domElement.addEventListener(
            "mouseup",
            this.onMouseUp.bind(this)
        );
    }

    public disable() {
        Global.renderer.domElement.removeEventListener(
            "mousemove",
            this.onMouseMove.bind(this)
        );
        Global.renderer.domElement.removeEventListener(
            "mousedown",
            this.onMouseDown.bind(this)
        );
        Global.renderer.domElement.removeEventListener(
            "mouseup",
            this.onMouseUp.bind(this)
        );
    }

    private onMouseMove(event: MouseEvent) {
        this._movement = [event.movementX, event.movementY];
    }

    private onMouseDown(event: MouseEvent) {
        Global.lockController.lock();
        this.mouseDown.add(event.button);
    }
    private onMouseUp(event: MouseEvent) {
        this.mouseUp.add(event.button);
    }

    public get movement() {
        return this._movement;
    }
    public lastUpdate() {
        this._movement = [0, 0];
        for (const down of this.mouseDown) {
            this.mousePressed.add(down);
        }
        this.mouseDown.clear();
        for (const down of this.mouseUp) {
            this.mousePressed.delete(down);
        }
        this.mouseUp.clear();
    }

    public isMousePressed(button: number): boolean {
        return this.mousePressed.has(button);
    }

    public isMouseUp(button: number): boolean {
        return this.mouseUp.has(button);
    }

    public isMouseDown(button: number): boolean {
        return this.mouseDown.has(button);
    }
}
