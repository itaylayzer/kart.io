import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Global } from "../store/Global";
import { damp, DEG2RAD } from "three/src/math/MathUtils.js";
import { CC, CS } from "../store/codes";
import { KeyboardController } from "../controller/KeyboardController";
import { Socket } from "socket.io";

export class PlayerModel {
  public update: () => void;
  constructor(
    body: CANNON.Body,
    keyboardController: KeyboardController,
    pid: string
  ) {
    const group = new THREE.Group();

    const model = new THREE.Group();

    group.add(model);

    let driftSide = [0, 0];

    this.update = () => {
      group.position.copy(body.position);
      group.quaternion.copy(body.quaternion);

      model.rotation.set(0, 0, 0);

      if (keyboardController.isKeyDown("Space")) {
        driftSide[0] = keyboardController.horizontalRaw * 0.6;
      }
      if (keyboardController.isKeyUp("Space")) {
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

      for (const [xpid, player] of Global.players.entries()) {
        const doSend =
          xpid === pid || player.position.distanceTo(body.position) < 10;
        doSend &&
          player.socket.emit(CC.UPDATE, {
            id: pid,
            position: model.getWorldPosition(new THREE.Vector3()),
            quaternion: model.getWorldQuaternion(new THREE.Quaternion()),
            velocity: body.velocity,
            velocityMagnitude: velocity,
            horizontal: keyboardController.horizontal,
          });
      }
    };

    Global.scene.add(group);
  }
}
