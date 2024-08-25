import { lerp } from "three/src/math/MathUtils.js";
import { Global } from "../store/Global";
import { CS } from "../store/codes";
import msgpack from "msgpack-lite";
const HORIZONTAL = 0;
const VERTICAL = 1;
const RAW_AXIS = 0;
const LERPED_AXIS = 1;

export class KeyboardController {
  private keysPressed: Set<number>;
  private keysDown: Set<number>;
  private keysUp: Set<number>;
  private keysAxis: [[number, number], [number, number]];

  constructor(enableOnStart: boolean = true) {
    this.keysPressed = new Set();
    this.keysDown = new Set();
    this.keysUp = new Set();
    this.keysAxis = [
      [0, 0],
      [0, 0],
    ];
    enableOnStart && this.enable();
  }

  public enable() {
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }
  public disable() {
    window.removeEventListener("keydown", this.onKeyDown.bind(this));
    window.removeEventListener("keyup", this.onKeyUp.bind(this));
  }

  private onKeyDown(event: KeyboardEvent) {
    Global.socket?.emitWithAck(CS.KEY_DOWN, msgpack.encode(event.which));
    this.keysDown.add(event.which);
  }

  private onKeyUp(event: KeyboardEvent) {
    Global.socket?.emitWithAck(CS.KEY_UP, msgpack.encode(event.which));
    this.keysPressed.delete(event.which);
    this.keysUp.add(event.which);
  }

  public isKeyPressed(code: number): boolean {
    return this.keysPressed.has(code);
  }

  public isKeyUp(code: number): boolean {
    return this.keysUp.has(code);
  }

  public isKeyDown(code: number): boolean {
    return this.keysDown.has(code);
  }

  public firstUpdate() {
    // Input axis processing
    this.keysAxis[RAW_AXIS][VERTICAL] = !Global.lockController.isLocked
      ? 0
      : +this.isKeyPressed(87) + -this.isKeyPressed(83);

    this.keysAxis[RAW_AXIS][HORIZONTAL] = !Global.lockController.isLocked
      ? 0
      : -(-this.isKeyPressed(65) + +this.isKeyPressed(68));

    // Smoothing inputs
    for (let index = 0; index < 2; index++) {
      this.keysAxis[LERPED_AXIS][index] = lerp(
        this.keysAxis[LERPED_AXIS][index],
        this.keysAxis[RAW_AXIS][index],
        Global.deltaTime * 7
      );
    }

    // Ignore small axis values (dead zone)
    for (let index = 0; index < 2; index++) {
      if (Math.abs(this.keysAxis[LERPED_AXIS][index]) < 0.05) {
        this.keysAxis[LERPED_AXIS][index] = 0;
      }
    }
  }

  public lastUpdate() {
    for (const down of this.keysDown) {
      this.keysPressed.add(down);
    }
    this.keysDown.clear();
    this.keysUp.clear();
  }

  public get vertical() {
    return this.keysAxis[LERPED_AXIS][VERTICAL];
  }
  public get horizontal() {
    return this.keysAxis[LERPED_AXIS][HORIZONTAL];
  }

  public get verticalRaw() {
    return this.keysAxis[RAW_AXIS][VERTICAL];
  }
  public get horizontalRaw() {
    return this.keysAxis[RAW_AXIS][HORIZONTAL];
  }
}
