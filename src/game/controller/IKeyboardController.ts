import { lerp } from "three/src/math/MathUtils.js";
import { Global } from "../store/Global";

const HORIZONTAL = 0;
const VERTICAL = 1;
const RAW_AXIS = 0;
const LERPED_AXIS = 1;

export class IKeyboardController {
  public keysDown: Set<number>;
  public keysUp: Set<number>;
  public keysPressed: Set<number>;
  public keysAxis: [[number, number], [number, number]];

  constructor() {
    this.keysDown = new Set();
    this.keysUp = new Set();
    this.keysPressed = new Set();
    this.keysAxis = [
      [0, 0],
      [0, 0],
    ];
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
    this.keysAxis[RAW_AXIS][VERTICAL] =
      +this.isKeyPressed(87) + -this.isKeyPressed(83);
    this.keysAxis[RAW_AXIS][HORIZONTAL] =
      +this.isKeyPressed(65) + -this.isKeyPressed(68);

    for (let index = 0; index < 2; index++) {
      // Smoothing inputs
      this.keysAxis[LERPED_AXIS][index] = lerp(
        this.keysAxis[LERPED_AXIS][index],
        this.keysAxis[RAW_AXIS][index],
        Global.deltaTime * 7
      );

      // Ignore small axis values (dead zone)
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
