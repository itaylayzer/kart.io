import * as THREE from "three";
import { Player } from "../../player/Player";
import { randomCirclePoint } from "../randomCirclePoint";
import { Global } from "../../store/Global";
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.02,
    transparent: true,
});
export class SpeedLine extends THREE.Line<
    THREE.BufferGeometry,
    THREE.LineBasicMaterial
> {
    constructor(opacity: number) {
        const geometry = new THREE.BufferGeometry();
        const material = lineMaterial.clone();
        material.opacity = opacity;
        // Create a Refractor object instead of a Mesh with ShaderMaterial
        super(geometry, material);

        Global.lod.add(this);
        Global.optimizedObjects.push(this);
    }
    public setLocationFromPlayer(player: Player) {
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
            1.75 + (Global.camera.fov - 100) / 10
        );

        // rx *= 9 / 16;
        ry *= 9 / 16;
        start.add(up.multiplyScalar(ry)).add(right.multiplyScalar(rx));
        const end = start.clone().add(forward.clone().multiplyScalar(0.5));

        this.geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    }
}
