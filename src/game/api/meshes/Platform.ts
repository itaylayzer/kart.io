import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicsObject } from "../../physics/PhysicsMesh";
import { Global } from "../../store/Global";

export class Platform extends PhysicsObject {
    constructor(
        width: number,
        height: number,
        depth: number,
        position: CANNON.Vec3
    ) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshPhongMaterial({ color: "#ccc" })
        );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        super(new THREE.Mesh(), {
            shape: new CANNON.Box(
                new CANNON.Vec3(width / 2, height / 2, depth / 2)
            ),
            mass: 0,
            position,
            material: new CANNON.Material({ friction: 0, restitution: 0 }),
            collisionFilterGroup: 2
        });

        mesh.position.copy(position);
        Global.scene.add(mesh);
        Global.world.addBody(this);
    }
}
