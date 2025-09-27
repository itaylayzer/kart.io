import * as THREE from "three";
import { Global } from "../store/Global";
import { LocalPlayer } from "../player/LocalPlayer";
import * as CANNON from "cannon-es";
import { lerp } from "three/src/math/MathUtils.js";
import { Player } from "../player/Player";
import { PerlinNoise } from "../api/PerlinNoise";

export class CameraController {
    public camera: THREE.PerspectiveCamera;
    public static sensitivity: number = 50;
    private time: number;
    private turboMode: number;
    private pid: number | false;
    private players: Player[];
    private perlin: PerlinNoise;

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
        camera.rotation.y = Math.PI;
        this.time = Math.PI * 4;
        this.pid = false;
        this.perlin = new PerlinNoise();
        this.turboMode = 0;
        this.players = [];
    }

    public update() {
        const localPlayer: Player = LocalPlayer.getInstance();

        if (this.players.length === 0) {
            this.players = Array.from(Player.clients.values());
        }

        const player = [localPlayer, this.players[this.pid as number]][
            +(this.pid !== false)
        ];
        if (Global.mouseController.isLocked) {
            if (this.pid === false) {
                this.pid = this.players
                    .map((v, i) => [i, v] as [number, Player])
                    .filter(([_, v]) => v.pid === localPlayer.pid)[0][0];
            } else {
                this.pid =
                    (this.pid + +Global.mouseController.isMouseDown(0)) %
                    this.players.length;
            }
        }
        if (player === undefined) return;

        this.turboMode = lerp(
            this.turboMode,
            +player.turboMode * +!player.rocketMode,
            Global.deltaTime * 10
        );

        let vertical = [player.keyboard.vertical + player.mushroomAddon, 2][
            +player.rocketMode
        ];
        let horizontal = [player.keyboard.horizontal, 0][+player.rocketMode];
        let driftSide = [player.driftSide, 0][+player.rocketMode];

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
        rightVec.multiplyScalar(1 * (horizontal + driftSide));
        const lookVec = rightVec.clone().multiplyScalar(0.5 / 3);

        this.camera.position
            .copy(vec)
            .add(
                forwardVec
                    .clone()
                    .multiplyScalar(
                        -1 / 2 +
                        (-(
                            vertical * (1 + this.turboMode) +
                            Math.abs(
                                driftSide - Math.abs(driftSide) * horizontal
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
            (horizontal + driftSide) * (0.05 + 0.04 * this.turboMode)
        );

        const speedDotQuatewrnion = player.velocity.dot(
            player.quaternion.vmult(new CANNON.Vec3(0, 0, 1))
        );

        const timeMultiplier = 4;
        const XYDivider = 300;

        const perlinValue =
            (this.perlin.get(0, (Global.elapsedTime % 2) * timeMultiplier) *
                Math.abs(speedDotQuatewrnion)) /
            XYDivider;

        this.camera.rotateX(perlinValue);
        this.camera.rotateY(perlinValue);
        this.camera.fov = Math.min(90 + Math.abs(speedDotQuatewrnion) * 2, 120);
        this.camera.updateProjectionMatrix();

        this.time += Global.deltaTime * 13;
    }
}
