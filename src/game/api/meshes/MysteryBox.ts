import { PhysicsObject } from "../../physics/PhysicsMesh";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Global } from "../../store/Global";
import { randFloat } from "three/src/math/MathUtils.js";
import { CS } from "@/server/store/codes";
export class MysteryBox extends PhysicsObject {
  public static boxes: Map<number, MysteryBox>;
  public mesh: THREE.Mesh;
  static {
    this.boxes = new Map();
  }
  constructor(id: number, position: CANNON.Vec3) {
    const size = 0.4;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshPhongMaterial({
        map: Global.assets.textures.mystery,
        opacity: 0.2,
        transparent: true,
        side: THREE.DoubleSide,
        emissiveIntensity: 5,
        emissive: "orange",
      })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    super(mesh, {
      shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
      mass: 0,
      position,
      material: new CANNON.Material({ friction: 0, restitution: 0 }),
      linearDamping: 0.9,
      angularDamping: 0.999,
      isTrigger: true,
      collisionFilterGroup: 3,
      collisionFilterMask: 1,
    });

    this.mesh = mesh;

    Global.scene.add(mesh);

    mesh.position.copy(position);
    this.position.set(position.x, position.y, position.z);

    let x = randFloat(-2, 2);
    let y = randFloat(-2, 2);
    let z = randFloat(-2, 2);

    this.update = [
      () => {
        mesh.position.copy(this.position);
        mesh.rotateX(x * Global.deltaTime);
        mesh.rotateY(y * Global.deltaTime);
        mesh.rotateZ(z * Global.deltaTime);
        // @ts-ignore
        this.quaternion.copy(mesh.quaternion);
      },
    ];

    MysteryBox.boxes.set(id, this);

    this.addEventListener("collide", () => {
      if (mesh.visible) {
        Global.socket?.emit(CS.TOUCH_MYSTERY, id);
      }
    });
    Global.world.addBody(this);
  }

  static toggleMystery(id: number, isVisible: boolean) {
    this.boxes.get(id)!.mesh.visible = isVisible;
  }
}
