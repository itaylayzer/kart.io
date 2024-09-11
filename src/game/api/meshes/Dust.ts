import { Easing, Tween } from "@tweenjs/tween.js";
import { PhysicsObject } from "../../physics/PhysicsMesh";
import { Global } from "../../store/Global";
import * as THREE from "three";
export class Dust extends PhysicsObject {
    constructor(position: THREE.Vector3) {
        const mesh =
            Global.assets.gltf.dust.scene.children[0].clone() as THREE.Mesh;
        const startScale = 0.3;
        const startOpacity = 0.8;
        mesh.scale.multiplyScalar(startScale);

        mesh.position.copy(position);

        (mesh.material as THREE.MeshStandardMaterial).transparent = true;
        (mesh.material as THREE.MeshStandardMaterial).opacity = startOpacity;
        super(mesh, {});
        const tween = new Tween({ x: 1 })
            .to({ x: 0 })
            .duration(Global.deltaTime * 5 * 1000)
            .onComplete(() => {
                Global.scene.remove(mesh);
            })
            .easing(Easing.Exponential.In)
            .onUpdate(({ x: opacity }) => {
                (mesh.material as THREE.MeshStandardMaterial).opacity =
                    startOpacity * opacity;
                mesh.scale.set(
                    startScale * opacity,
                    startScale * opacity,
                    startScale * opacity
                );
            });
        tween.start(0);
        const startTime = Global.elapsedTime;
        this.update = [
            () => {
                mesh.visible = position.distanceTo(Global.camera.position) < 50;
                tween.update((Global.elapsedTime - startTime) * 1000);
            },
        ];
        Global.scene.add(mesh);
    }
}
