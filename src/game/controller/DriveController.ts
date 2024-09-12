import * as CANNON from "cannon-es";
import { Global } from "../store/Global";

import * as THREE from "three";
import { damp, lerp } from "three/src/math/MathUtils.js";
import { IKeyboardController } from "./IKeyboardController";
import clamp from "../api/clamp";
import { AudioController } from "./AudioController";
import { Player } from "../player/Player";
import msgpack from "msgpack-lite";
import { CS } from "../store/codes";
const maxDistance = 1;
export class DriveController {
    public update: () => [boolean, number, boolean, number];
    public turbo: () => void;
    public shake: () => void;
    public rocket: (pos: CANNON.Vec3, quat: CANNON.Quaternion) => void;
    public mushroom: () => void;

    constructor(
        public maxSpeed: number,
        body: Player,
        keyboard: IKeyboardController,
        audio: AudioController,
        islocal: boolean
    ) {
        let steeringAngle = 0;
        let maxSteeringAngle = 15; // Limit steering angle (30 degrees)
        let raycaster = new THREE.Raycaster();
        let driftTime = 0;
        let driftSide = [0, 0];
        let speedTime = 0;
        let turboMode = false;
        let turboTimeoutID: number | undefined = undefined;
        let rocketTimeoutID: number | undefined = undefined;
        let rocketMode = false;
        let shakeMode = false;
        let mushroomAddon = 0;

        const putToGround = () => {
            raycaster.set(
                new THREE.Vector3()
                    .copy(body.position)
                    .add(new THREE.Vector3(0, 0.2, 0)),
                new THREE.Vector3(0, -1, 0).applyQuaternion(body.quaternion)
            );
            const intercetions = raycaster.intersectObjects(Global.roadMesh);

            const closestIntersection =
                intercetions.length === 0
                    ? undefined
                    : intercetions.length === 1
                    ? intercetions[0]
                    : intercetions.reduce((a, b) =>
                          a.distance > b.distance ? b : a
                      );

            if (
                closestIntersection === undefined ||
                closestIntersection.distance > maxDistance
            ) {
                // this.body.position.copy(this.last);

                const releventTransfer =
                    body.tracker.getPointTransform() as THREE.Object3D;

                const A = new THREE.Vector3()
                    .copy(body.position)
                    .sub(releventTransfer.position);
                const B = new THREE.Vector3(1, 0, 0).applyQuaternion(
                    releventTransfer.quaternion
                );

                let impulse = B.clone();

                if (A.dot(B) > 0) {
                    impulse.negate();
                }

                impulse.multiplyScalar(5);

                body.applyImpulse(
                    new CANNON.Vec3(impulse.x, impulse.y, impulse.z)
                );
                return;
            }

            // const up = closestIntersection.normal;

            const groundPoint = closestIntersection.point!;
            const groundNormal = closestIntersection.normal;

            // Adjust the kart's position to the ground
            body.position.y = groundPoint.y;

            if (groundNormal === undefined) return;

            // Convert the current up vector and ground normal to CANNON.Vec3
            const currentUp = body.quaternion.vmult(new CANNON.Vec3(0, 1, 0));
            const groundNormalCannon = new CANNON.Vec3(
                groundNormal.x,
                groundNormal.y,
                groundNormal.z
            );

            // Calculate the quaternion needed to align the up vector with the ground normal
            const alignUpQuat = new CANNON.Quaternion();
            alignUpQuat.setFromVectors(currentUp, groundNormalCannon);

            // Apply the alignment quaternion to the current quaternion
            body.quaternion = alignUpQuat.mult(body.quaternion);
        };

        islocal &&
            setInterval(() => {
                if (rocketMode || shakeMode || body.velocity.isZero()) return;
                Global.socket?.emit(
                    CS.UPDATE_TRANSFORM,
                    msgpack.encode([
                        body.pid,
                        body.position.x,
                        body.position.y,
                        body.position.z,
                        body.quaternion.x,
                        body.quaternion.y,
                        body.quaternion.z,
                        body.quaternion.w,
                    ])
                );
            }, 1000);

        const keyboardUpdate = () => {
            if (keyboard.isKeyDown(32) || keyboard.isKeyDown(-6)) {
                driftSide[0] = keyboard.horizontalRaw * 1;
                driftTime = 0;
            }
            if (
                driftSide[0] !== 0 &&
                (keyboard.isKeyPressed(32) || keyboard.isKeyPressed(-6))
            ) {
                driftTime += Global.deltaTime;
            }
            if (keyboard.isKeyUp(32) || keyboard.isKeyUp(-6) || driftTime > 3) {
                driftSide[0] = 0;
                driftTime = 0;
            }

            if (keyboard.horizontalRaw !== 0) {
                speedTime = 0;
            }
            speedTime += Global.deltaTime;

            driftSide[1] = damp(
                driftSide[1],
                driftSide[0],
                1.5,
                Global.deltaTime * 7
            );
            const driftSpeedMultiplier =
                driftTime < 1 ? Math.sqrt(driftTime) : 5;

            const timeSpeedMultiplier = clamp((speedTime - 1) / 3, 0, 5);

            // Determine forward direction
            const forward = new CANNON.Vec3(0, 0, 1);
            body.quaternion.vmult(forward, forward);

            // Apply forward/reverse force
            const drivingForce = forward.scale(
                keyboard.vertical *
                    (maxSpeed +
                        +turboMode * maxSpeed +
                        driftSpeedMultiplier +
                        timeSpeedMultiplier) *
                    2 *
                    +!shakeMode
            );

            // Calculate and apply friction (simplified)
            const velocity = body.velocity.clone();
            const frictionForce = velocity.scale(-2); // Adjust friction coefficient as needed

            // Combine driving force and friction
            const totalForce = drivingForce.vadd(frictionForce);
            body.force.copy(totalForce);

            // Steering mechanics
            steeringAngle =
                (keyboard.horizontal + driftSide[1]) *
                maxSteeringAngle *
                keyboard.vertical;

            // Calculate the steering direction using quaternion
            const steeringQuaternion = new CANNON.Quaternion();
            steeringQuaternion.setFromAxisAngle(
                new CANNON.Vec3(0, 1, 0),
                steeringAngle * 0.1 * Global.deltaTime
            );

            // Apply steering by rotating the kart's quaternion
            body.quaternion.mult(steeringQuaternion, body.quaternion);

            // Optional: Apply angular damping to stabilize turning
            const angularDamping = 0.95;
            body.angularVelocity.scale(angularDamping, body.angularVelocity);

            putToGround();

            const velocityMagnitude = Math.abs(
                body.velocity.dot(
                    body.quaternion.vmult(new CANNON.Vec3(0, 0, 1))
                )
            );

            islocal &&
                Global.settings.displayVelocity &&
                (document.querySelector(
                    "p#velocity"
                )!.innerHTML = `${velocityMagnitude.toFixed(2)} KM/S`);

            audio.update(velocityMagnitude);

            mushroomAddon = lerp(mushroomAddon, 0, Global.deltaTime * 5);

            return [turboMode, driftSide[1], false, mushroomAddon] as [
                boolean,
                number,
                boolean,
                number
            ];
        };

        const rocketUpdate = () => {
            const { quaternion: ThreeQuaternion } =
                body.tracker.getPointTransform(body.position);
            const quaternion = new CANNON.Quaternion(
                ThreeQuaternion.x,
                ThreeQuaternion.y,
                ThreeQuaternion.z,
                ThreeQuaternion.w
            );
            body.quaternion.slerp(
                quaternion,
                Global.deltaTime * 10,
                body.quaternion
            );

            const forward = new CANNON.Vec3(0, 0, 1);
            quaternion.vmult(forward, forward);

            const drivingForce = forward.scale(5);

            body.velocity.lerp(
                drivingForce,
                Global.deltaTime * 7,
                body.velocity
            );

            driftSide[1] = driftSide[0] = 0;
            putToGround();

            return [false, 0, true, 0] as [boolean, number, boolean, number];
        };

        this.update = () => [keyboardUpdate, rocketUpdate][+rocketMode]();
        this.turbo = () => {
            turboTimeoutID != undefined && clearTimeout(turboTimeoutID);

            turboMode = true;
            // @ts-ignore typescripts make it setTimeout by nodejs insted of webapi
            turboTimeoutID = setTimeout(() => {
                turboMode = false;
            }, 5000);
        };
        this.shake = () => {
            shakeMode = !rocketMode;
            shakeMode && body.model.shake(1000);

            // @ts-ignore typescripts make it setTimeout by nodejs insted of webapi
            rocketTimeoutID = setTimeout(() => {
                shakeMode = false;
            }, 1000);
        };
        this.rocket = (pos, quat) => {
            body.position.copy(pos);
            body.quaternion.copy(quat);
            rocketTimeoutID != undefined && clearTimeout(rocketTimeoutID);

            body.model.setRocketModel(true);
            rocketMode = true;

            // @ts-ignore typescripts make it setTimeout by nodejs insted of webapi
            rocketTimeoutID = setTimeout(() => {
                rocketMode = false;
                body.model.setRocketModel(false);
            }, 5000);
        };
        this.mushroom = () => {
            const forwardVec = body.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
            mushroomAddon = 1;
            body.applyImpulse(forwardVec.scale(40));
        };
    }
}
