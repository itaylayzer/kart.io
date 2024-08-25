import createPlayerNameSprite from "../api/createPlayerNameSprite";
import * as THREE from "three";
import { Global } from "../store/Global";
export class Player {
  public static clients: Map<number, Player>;

  public update: (
    position: THREE.Vector3Like,
    quaternion: THREE.Quaternion,
    velocity: THREE.Vector3Like,
    velocityMagnitude: number
  ) => void;

  public predictedUpdate: () => void;
  public disconnect: () => void;
  static {
    this.clients = new Map();
  }
  public position: THREE.Vector3;
  public quaternion: THREE.Quaternion;

  constructor(public pid: number, public name: string, tagNameColor: string) {
    this.position = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
    Player.clients.set(pid, this);

    const group = new THREE.Group();
    const model = Global.assets.gltf.car.scene.clone();
    model.scale.multiplyScalar(0.5 / 3);

    group.add(model);
    const backweels = model.getObjectByName("Back_Wheels_38")!;
    const frontweels = model.getObjectByName("Front_Wheels_47")!;
    const steeringweel = model.getObjectByName("Wheel_25")!;
    model.getObjectByName("Back_18")!.visible = false;

    const nametag = createPlayerNameSprite(name, tagNameColor);
    nametag.position.y += 0.35;
    group.add(nametag);
    const _vel = new THREE.Vector3();

    const queue: Array<() => void> = [];

    this.update = (position, quaternion, velocity, velocityMagnitude) => {
      queue.push(() => {
        group.position.copy(this.position.copy(position));
        group.quaternion.copy(this.quaternion.copy(quaternion));
        model.rotation.set(0, 0, 0);

        _vel.copy(velocity);

        backweels.rotateX(velocityMagnitude);
        frontweels.rotation.y = Global.keyboardController.horizontal * 0.4;

        for (const [id, cf] of frontweels.children.entries()) {
          id < 2
            ? cf.rotateY(velocityMagnitude)
            : cf.rotateX(velocityMagnitude);
        }

        steeringweel.rotation.set(0, 0, 0);
        steeringweel.rotateOnAxis(
          new THREE.Vector3(0, -0.425, 1),
          (-Global.keyboardController.horizontal * Math.PI * 2) / 3
        );
      });
    };

    this.predictedUpdate = () => {
      if (queue.length === 0) {
        this.position.copy(
          group.position.add(_vel.clone().multiplyScalar(Global.deltaTime))
        );
      }
      while (queue.length) {
        queue.pop()!();
      }
    };

    this.disconnect = () => {
      Global.scene.remove(group);
      Player.clients.delete(pid);
    };

    Global.scene.add(group);
  }
}
