import { LocalPlayer } from "../player/LocalPlayer";
import { Global } from "../store/Global";
import { CS } from "../store/codes";
import { IKeyboardController } from "./IKeyboardController";
import msgpack from "msgpack-lite";
export class KeyboardController extends IKeyboardController {
  constructor(enableOnStart: boolean = true) {
    super();
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
