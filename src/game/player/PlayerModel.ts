import * as THREE from "three";
import { IKeyboardController } from "../controller/IKeyboardController";
import { damp } from "three/src/math/MathUtils.js";
import { Global } from "../store/Global";
import createPlayerNameSprite from "../api/createPlayerNameSprite";
import * as CANNON from "cannon-es";

const namesToColor = [
  "Object_43",
  "Object_41",
  "Object_87",
  "Object_85",
  "Object_68",
  "Object_70",
  "Object_83",
  "Object_62",
  "Object_66",
  "Object_72",
  "Object_64",
  "Object_79",
  "Object_89",
  "Object_81",
];

export class PlayerModel extends THREE.Group {
  public update: () => void;
  constructor(
    body: CANNON.Body,
    keyboard: IKeyboardController,
    name: string,
    tagNameColor: [string, number],
    isLocal: boolean
  ) {
    super();
    const model = Global.assets.gltf.car.scene.clone();

    model.traverse((part) => {
      const partAsMesh = part as THREE.Mesh;
      if (partAsMesh) {
        const mat = partAsMesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          if (namesToColor.includes(partAsMesh.name)) {
            partAsMesh.material = new THREE.MeshPhongMaterial({
              color: tagNameColor[0],
              emissive: tagNameColor[0],
              emissiveIntensity: tagNameColor[1],
            });
          } else {
            mat.roughness = 1;
            mat.metalness = 0.8;
          }
        }
      }
    });
    model.scale.multiplyScalar(0.5 / 3);

    const backweels = model.getObjectByName("Back_Wheels_38")!;
    const frontweels = model.getObjectByName("Front_Wheels_47")!;
    const steeringweel = model.getObjectByName("Wheel_25")!;
    model.getObjectByName("Back_18")!.visible = false;
    super.add(model);

    if (!isLocal) {
      const nametag = createPlayerNameSprite(name);
      nametag.position.y += 0.35;
      super.add(nametag);
    }
    let driftSide = [0, 0];

    this.update = () => {
      this.position.copy(body.position);
      this.quaternion.copy(body.quaternion);

      model.rotation.set(0, 0, 0);

      if (keyboard.isKeyDown(32)) {
        driftSide[0] = keyboard.horizontalRaw * 0.6;
      }
      if (keyboard.isKeyUp(32)) {
        driftSide[0] = 0;
      }

      driftSide[1] = damp(
        driftSide[1],
        driftSide[0],
        1.5,
        Global.deltaTime * 7
      );
      model.rotateOnAxis(new THREE.Vector3(0, 1, 0), driftSide[1]);

      this.rotation.set(0, 0, 0);

      const forwardVec = body.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
      const velocityMagnitude = forwardVec.dot(body.velocity.clone());

      backweels.rotateX(velocityMagnitude);
      frontweels.rotation.y = keyboard.horizontal * 0.4;

      for (const [id, cf] of frontweels.children.entries()) {
        id < 2 ? cf.rotateY(velocityMagnitude) : cf.rotateX(velocityMagnitude);
      }

      steeringweel.rotation.set(0, 0, 0);
      steeringweel.rotateOnAxis(
        new THREE.Vector3(0, -0.425, 1),
        (-keyboard.horizontal * Math.PI * 2) / 3
      );

      this.position.copy(body.position);
      this.quaternion.copy(body.quaternion);
      // isLocal &&
      //   (document.querySelector("p#velocity")!.innerHTML = `${Math.abs(
      //     velocityMagnitude
      //   ).toFixed(2)} KM/S`);
    };
  }
}
