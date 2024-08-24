import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicsObject } from "../physics/PhysicsMesh";

export class Player extends PhysicsObject {
  constructor(public mesh: THREE.Object3D) {
    const radius = 0.8 / 3;
    super(mesh, {
      shape: new CANNON.Cylinder(radius, radius, radius),
      mass: 1,
      position: new CANNON.Vec3(0, 5, 0),
      material: new CANNON.Material({ friction: 0, restitution: 0 }),
      collisionFilterGroup: 1,
      collisionFilterMask: ~0,
    });
    this.fixedRotation = true;
    this.updateMassProperties(); // Update mass properties after changing fixedRotation
    this.angularFactor.set(0, 1, 0); // Allow rotation only around the y-axis

    this.offsets.position.y = -2;
  }
}
