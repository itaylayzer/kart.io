import * as THREE from "three";
import { Global } from "../store/Global";
import { IKeyboardController } from "../controller/IKeyboardController";
import { DriveController } from "../controller/DriveController";
import { PhysicsObject } from "../physics/PhysicsMesh";
import * as CANNON from "cannon-es";
import { PlayerModel } from "./PlayerModel";
import { curvePoints } from "../constants/road";
export class Player extends PhysicsObject {
  public static clients: Map<number, Player>;

  public disconnect: () => void;
  static {
    this.clients = new Map();
  }

  constructor(
    public pid: number,
    isLocal: boolean,
    public name: string,
    tagNameColor: string,
    public keyboard: IKeyboardController
  ) {
    const radius = 0.8 / 3;

    super(new THREE.Object3D(), {
      shape: new CANNON.Cylinder(radius, radius, radius),
      mass: 1,
      position: new CANNON.Vec3(0, 0, 0),
      material: new CANNON.Material({ friction: 0, restitution: 0 }),
      collisionFilterGroup: 1,
      collisionFilterMask: ~0,
    });

    pid !== undefined && Player.clients.set(pid, this);

    const engine = new DriveController(5, this, this.keyboard);
    const model = new PlayerModel(this, keyboard, name, tagNameColor, isLocal);

    this.update = [
      () => {
        keyboard.firstUpdate();
        isLocal && Global.cameraController.update();
        engine.update();
        model.update();
        keyboard.lastUpdate();
      },
    ];

    this.disconnect = () => {
      Global.scene.remove(model);
      Global.world.removeBody(this);

      pid !== undefined && Player.clients.delete(pid);
    };

    Global.world.addBody(this);
    Global.scene.add(model);
  }

  public applyTransform(transform: number[]) {
    [
      this.position.x,
      this.position.y,
      this.position.z,
      this.quaternion.x,
      this.quaternion.y,
      this.quaternion.z,
      this.quaternion.w,
    ] = transform;
  }
}
