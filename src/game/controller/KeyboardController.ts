import { LocalPlayer } from "../player/LocalPlayer";
import { Global } from "../store/Global";
import { CS } from "../store/codes";
import { IKeyboardController } from "./IKeyboardController";
import msgpack from "msgpack-lite";

export class KeyboardController extends IKeyboardController {
  constructor(enableOnStart: boolean = true) {
    super();
    enableOnStart && this.enable();

    let oldButtons = new Array(16).map((_) => false);
    this.beforeFirstUpdate = () => {
      const gamePad = navigator.getGamepads()[0];
      if (gamePad === null) return;

      const updatedButtons = gamePad.buttons.map((v) => v.pressed);
      for (let i = 0; i < 16; i++) {
        if (oldButtons[i] && !updatedButtons[i]) {

          this.keysUp.add(-i - 1);
          this.keysPressed.delete(-i - 1);
        }
        if (!oldButtons[i] && updatedButtons[i]) {

          this.keysDown.add(-i - 1);

          if (!Global.lockController.isLocked) {
            Global.lockController.lock();
          }
          if (i === 9 && Global.lockController.isLocked) {
            Global.lockController.unlock();
          }
        }
      }
      oldButtons = updatedButtons;

      if (updatedButtons[14] || updatedButtons[15]) return;

      if (gamePad.axes[0] > 0.2 && !this.keysPressed.has(-16)) {
        this.keysDown.add(-16);
      } else {
        if (gamePad.axes[0] <= 0 && this.keysPressed.has(-16)) {
          this.keysUp.add(-16);
          this.keysPressed.delete(-16);
        }
      }
      if (gamePad.axes[0] < -0.2 && !this.keysPressed.has(-15)) {
        this.keysDown.add(-15);
      } else {
        if (gamePad.axes[0] >= 0 && this.keysPressed.has(-15)) {
          this.keysUp.add(-15);
          this.keysPressed.delete(-15);
        }
      }
    };
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
    if (!Global.lockController.isLocked || this.keysPressed.has(event.which))
      return;
    this.keysDown.add(event.which);

    const data = [event.which];
    if ([87, 83, 68, 65].includes(event.which)) {
      const local = LocalPlayer.getInstance();
      data.push(local.position.x);
      data.push(local.position.y);
      data.push(local.position.z);
      data.push(local.quaternion.x);
      data.push(local.quaternion.y);
      data.push(local.quaternion.z);
      data.push(local.quaternion.w);
    }

    Global.socket?.emitWithAck(CS.KEY_DOWN, msgpack.encode(data));
  }

  private onKeyUp(event: KeyboardEvent) {
    if (!Global.lockController.isLocked) return;

    this.keysPressed.delete(event.which);
    this.keysUp.add(event.which);

    const data = [event.which];
    if ([87, 83, 68, 65].includes(event.which)) {
      const local = LocalPlayer.getInstance();
      data.push(local.position.x);
      data.push(local.position.y);
      data.push(local.position.z);
      data.push(local.quaternion.x);
      data.push(local.quaternion.y);
      data.push(local.quaternion.z);
      data.push(local.quaternion.w);
    }

    Global.socket?.emitWithAck(CS.KEY_UP, msgpack.encode([event.which]));
  }
}
