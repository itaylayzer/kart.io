import { PhysicsObject } from "../../physics/PhysicsMesh";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Global } from "../../store/Global";

export class BoxObject extends PhysicsObject {
  constructor(
    size: number,
    color: THREE.ColorRepresentation,
    position: CANNON.Vec3
  ) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshPhongMaterial({ color })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    super(mesh, {
      shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
      mass: size * 5 * size,
      position,
      material: new CANNON.Material({ friction: 0, restitution: 0 }),
      linearDamping: 0.9,
      angularDamping: 0.999,
      collisionFilterGroup: 2,
      collisionFilterMask: ~0,
    });

    Global.scene.add(mesh);
    Global.world.addBody(this);

    mesh.position.copy(position);
    this.position.set(position.x, position.y, position.z);

    this.update = [
      () => {
        mesh.position.copy(this.position);
        mesh.quaternion.copy(this.quaternion);
      },
    ];
  }
}
