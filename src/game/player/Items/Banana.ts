import * as CANNON from "cannon-es";
import * as THREE from "three";
import { PhysicsObject } from "../../physics/PhysicsMesh";
import { Global } from "../../store/Global";
export class Banana extends PhysicsObject {
    constructor(notFromId: number, position: CANNON.Vec3) {
        const mesh = Global.assets.gltf.banana.scene.clone();
        mesh.children[0].position.set(-45, 0, -23.118);
        mesh.scale.multiplyScalar(0.002);

        const banaColor = mesh.getObjectByName("Object_2") as THREE.Mesh;
        (banaColor.material as THREE.MeshStandardMaterial).emissive =
            new THREE.Color("gold");
        (
            banaColor.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 2;

        super(mesh, {
            isTrigger: true,
            shape: new CANNON.Box(new CANNON.Vec3(0.225, 0.1, 0.225)),
            position,
            mass: 0,
            collisionFilterGroup: 3,
            collisionFilterMask: 1,
        });
        mesh.position.copy(position);

        const timeout = setTimeout(() => {
            Global.scene.remove(mesh);
            Global.world.removeBody(this);
        }, 10 * 1000);

        this.addEventListener("collide", (event: { body: CANNON.Body }) => {
            if (event.body.id === notFromId) return;
            clearTimeout(timeout);

            Global.scene.remove(mesh);
            Global.world.removeBody(this);

            // TODO: apply force! event.body.engine.shake()!
        });
        this.update = [
            () => {
                mesh.visible =
                    mesh.position.distanceTo(Global.camera.position) < 50;

                mesh.rotateY(Global.deltaTime * 7);
            },
        ];

        Global.scene.add(mesh);
        Global.world.addBody(this);
    }
}
