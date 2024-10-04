import * as THREE from "three";
import { Player } from "../../player/Player";
import { randomCirclePoint } from "../randomCirclePoint";
import { Global } from "../../store/Global";
import { Refractor } from "three/examples/jsm/objects/Refractor.js"; // Import Refractor
import { WaterRefractionShader } from "three/examples/jsm/shaders/WaterRefractionShader.js"; // Import shader

export class SpeedLine1 extends Refractor {
    constructor(player: Player) {
        const start = new THREE.Vector3().copy(player.position);
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(
            player.quaternion
        );
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(
            player.quaternion
        );
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
            player.quaternion
        );
        let { x: rx, y: ry } = randomCirclePoint(
            2 + (Global.camera.fov - 100) / 10
        );

        rx *= 9 / 16;
        start.add(up.multiplyScalar(ry)).add(right.multiplyScalar(rx));
        const end = start.clone().add(forward.clone().multiplyScalar(0.5));

        // Replace the BoxGeometry with PlaneGeometry for the refractor
        const geometry = new THREE.PlaneGeometry(2, 2); // Size of the distortion effect

        // Create a Refractor object instead of a Mesh with ShaderMaterial
        super(geometry, {
            color: new THREE.Color(0xffffff), // Base color (can be adjusted)
            textureWidth: 512,
            textureHeight: 512,
            shader: WaterRefractionShader, // Use the WaterRefractionShader
        });

        const dudvMap = Global.assets.textures.water.clone();
        this.position.copy(end);
        this.lookAt(Global.camera.position);
        dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;
        this.material.uniforms.tDudv.value = dudvMap;
        this.material.uniforms.time.value = Global.elapsedTime;
        // Set refractor position
        // this.position.copy(end);

        Global.updates.push(() => {
            this.material.uniforms.time.value = Global.elapsedTime;
        });
        // requestAnimationFrame(() => {
        //     Global.lod.remove(refractor);
        //     Global.optimizedObjects.splice(
        //         Global.optimizedObjects.indexOf(refractor),
        //         1
        //     );
        // });
    }
}
