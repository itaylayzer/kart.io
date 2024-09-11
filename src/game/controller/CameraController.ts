import * as THREE from "three";
import { Global } from "../store/Global";
import { LocalPlayer } from "../player/LocalPlayer";
import * as CANNON from "cannon-es";
import { lerp } from "three/src/math/MathUtils.js";
import { Player } from "../player/Player";
function explodeFn(t: number) {
    return t < Math.PI * 4
        ? (100 * Math.sin(t + Math.PI)) / Math.pow(t + Math.PI, 3)
        : 0;
}
function randomSign() {
    if (Math.random() > 0.66) return -1;
    if (Math.random() < 0.33) return 1;
    return 0;
}

export class CameraController {
    public camera: THREE.PerspectiveCamera;
    public static sensitivity: number = 50;
    private time: number;
    private turboMode: number;

    private forceRotation: THREE.Vector3;
    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
        camera.rotation.y = Math.PI;
        this.time = Math.PI * 4;

        this.forceRotation = new THREE.Vector3();
        this.turboMode = 0;
    }

    public update() {
        const player: Player = LocalPlayer.getInstance();
        if (player === undefined) return;

        this.turboMode = lerp(
            this.turboMode,
            +player.turboMode,
            Global.deltaTime * 10
        );

        const vec = player.position.clone();
        const forwardVec = new THREE.Vector3(0, 0, 1).applyQuaternion(
            player.quaternion
        );

        const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(
            player.quaternion
        );

        const upVec = new THREE.Vector3(0, 1, 0).applyQuaternion(
            player.quaternion
        );
        rightVec.multiplyScalar(
            1 * (player.keyboard.horizontal + player.driftSide)
        );
        const lookVec = rightVec.clone().multiplyScalar(0.5 / 3);

        this.camera.position
            .copy(vec)
            .add(
                forwardVec
                    .clone()
                    .multiplyScalar(
                        -1 / 2 +
                            (-(
                                player.keyboard.vertical *
                                    (1 + this.turboMode) +
                                Math.abs(
                                    player.driftSide -
                                        Math.abs(player.driftSide) *
                                            player.keyboard.horizontal
                                )
                            ) *
                                Global.settings.fovChange) /
                                5
                    )
            )
            .add(rightVec.clone().multiplyScalar(0.5 / 2))
            .add(upVec.clone().multiplyScalar(1 / 2));

        lookVec.add(player.position);
        lookVec.add(new CANNON.Vec3(0, 0.6 / 3, 0));

        this.camera.lookAt(new THREE.Vector3().copy(lookVec));
        this.camera.rotateZ(
            (player.keyboard.horizontal + player.driftSide) *
                (0.05 + 0.04 * this.turboMode)
        );

        this.time += Global.deltaTime * 13;
        this.camera.rotation.z += this.forceRotation.z * explodeFn(this.time);
        this.camera.rotation.x += this.forceRotation.x * explodeFn(this.time);
        this.camera.rotation.y += this.forceRotation.y * explodeFn(this.time);
    }

    shake(distance: number) {
        this.time = 0; //0.93656;
        this.forceRotation.z =
            (randomSign() * Math.random()) / (distance * distance);
        this.forceRotation.x = (randomSign() * Math.random()) / distance;
        this.forceRotation.y = (randomSign() * Math.random()) / distance;
    }
}
