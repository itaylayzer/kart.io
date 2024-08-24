import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Global } from "../store/Global";
import { damp, DEG2RAD } from "three/src/math/MathUtils.js";
import createPlayerNameSprite from "../api/createPlayerNameSprite";
import { CS } from "../store/codes";

export class PlayerModel {
  public update: () => void;
  constructor(body: CANNON.Body, name: string) {
    const group = new THREE.Group();

    const color = "#072c57";

    const nametag = createPlayerNameSprite(name, color);
    nametag.position.y += 0.35;
    group.add(nametag);
    const model = Global.assets.gltf.car.scene.clone();
    model.scale.multiplyScalar(0.5 / 3);

    group.add(model);
    const backweels = model.getObjectByName("Back_Wheels_38")!;
    const frontweels = model.getObjectByName("Front_Wheels_47")!;
    const steeringweel = model.getObjectByName("Wheel_25")!;

    model.getObjectByName("Back_18")!.visible = false;

    let driftSide = [0, 0];

    this.update = () => {
      group.position.copy(body.position);
      group.quaternion.copy(body.quaternion);

      model.rotation.set(0, 0, 0);

      if (Global.keyboardController.isKeyDown("Space")) {
        driftSide[0] = Global.keyboardController.horizontalRaw * 0.6;
      }
      if (Global.keyboardController.isKeyUp("Space")) {
        driftSide[0] = 0;
      }

      driftSide[1] = damp(
        driftSide[1],
        driftSide[0],
        1.5,
        Global.deltaTime * 7
      );
      model.rotateOnAxis(new THREE.Vector3(0, 1, 0), driftSide[1]);

      const forward = body.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
      const velocity = body.velocity.dot(forward) * DEG2RAD;

      backweels.rotateX(velocity);
      frontweels.rotation.y = Global.keyboardController.horizontal * 0.4;

      for (const [id, cf] of frontweels.children.entries()) {
        id < 2 ? cf.rotateY(velocity) : cf.rotateX(velocity);
      }

      steeringweel.rotation.set(0, 0, 0);
      steeringweel.rotateOnAxis(
        new THREE.Vector3(0, -0.425, 1),
        (-Global.keyboardController.horizontal * Math.PI * 2) / 3
      );

      Global.socket?.emit(CS.UPDATE, {
        position: model.getWorldPosition(new THREE.Vector3()),
        quaternion: model.getWorldQuaternion(new THREE.Quaternion()),
        velocity,
        horizontal: Global.keyboardController.horizontal,
      });
    };

    Global.scene.add(group);
  }
}
