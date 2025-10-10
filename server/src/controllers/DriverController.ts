import { PlayerEntity } from "@/entities/PlayerEntity";
import * as CANNON from "cannon-es";
import * as THREE from "three";

const maxDistance = 1;
export class DriveController {
    public update: () => [boolean, number, boolean, number];
    public turbo: () => void;
    public shake: () => void;
    public rocket: (pos: CANNON.Vec3, quat: CANNON.Quaternion) => void;
    public mushroom: () => void;

    constructor(
        public maxSpeed: number,
        player: PlayerEntity,
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
                    .copy(player.position)
                    .add(new THREE.Vector3(0, 0.2, 0)),
                new THREE.Vector3(0, -1, 0).applyQuaternion(player.quaternion)
            );
            const intercetions = raycaster.intersectObjects(player.context.roadMesh);

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
                    player.tracker.getPointTransform() as THREE.Object3D;

                const A = new THREE.Vector3()
                    .copy(player.position)
                    .sub(releventTransfer.position);
                const B = new THREE.Vector3(1, 0, 0).applyQuaternion(
                    releventTransfer.quaternion
                );

                let impulse = B.clone();

                if (A.dot(B) > 0) {
                    impulse.negate();
                }

                impulse.multiplyScalar(5);

                player.applyImpulse(
                    new CANNON.Vec3(impulse.x, impulse.y, impulse.z)
                );
                return;
            }

            // const up = closestIntersection.normal;

            const groundPoint = closestIntersection.point!;
            const groundNormal = closestIntersection.normal;

            // Adjust the kart's position to the ground
            player.position.y = groundPoint.y;

            if (groundNormal === undefined) return;

            // Convert the current up vector and ground normal to CANNON.Vec3
            const currentUp = player.quaternion.vmult(new CANNON.Vec3(0, 1, 0));
            const groundNormalCannon = new CANNON.Vec3(
                groundNormal.x,
                groundNormal.y,
                groundNormal.z
            );

            // Calculate the quaternion needed to align the up vector with the ground normal
            const alignUpQuat = new CANNON.Quaternion();
            alignUpQuat.setFromVectors(currentUp, groundNormalCannon);

            // Apply the alignment quaternion to the current quaternion
            player.quaternion = alignUpQuat.mult(player.quaternion);
        };

        const keyboardUpdate = () => {
            if (keyboard.isKeyDown(32) || keyboard.isKeyDown(-6)) {
                driftSide[0] = keyboard.horizontalRaw * 1;
                driftTime = 0;
            }
            if (
                driftSide[0] !== 0 &&
                (keyboard.isKeyPressed(32) || keyboard.isKeyPressed(-6))
            ) {
                driftTime += player.context.deltaTime;
            }
            if (keyboard.isKeyUp(32) || keyboard.isKeyUp(-6) || driftTime > 3) {
                driftSide[0] = 0;
                driftTime = 0;
            }

            if (keyboard.horizontalRaw !== 0) {
                speedTime = 0;
            }
            speedTime += player.context.deltaTime;

            driftSide[1] = THREE.MathUtils.damp(
                driftSide[1],
                driftSide[0],
                1.5,
                player.context.deltaTime * 7
            );
            const driftSpeedMultiplier =
                driftTime < 1 ? Math.sqrt(driftTime) : 5;

            const timeSpeedMultiplier = THREE.MathUtils.clamp((speedTime - 1) / 3, 0, 5);

            // Determine forward direction
            const forward = new CANNON.Vec3(0, 0, 1);
            player.quaternion.vmult(forward, forward);

            // Apply forward/reverse force
            const drivingForce = forward.scale(
                keyboard.vertical *
                (maxSpeed +
                    +turboMode * maxSpeed +
                    driftSpeedMultiplier +
                    timeSpeedMultiplier) *
                2 *
                +!shakeMode *
            );
            // Calculate and apply friction (simplified)
            const velocity = player.velocity.clone();
            const frictionForce = velocity.scale(-2); // Adjust friction coefficient as needed

            // Combine driving force and friction
            const totalForce = drivingForce.vadd(frictionForce);

            player.force.copy(totalForce);

            // Steering mechanics
            steeringAngle =
                (keyboard.horizontal + driftSide[1]) *
                maxSteeringAngle *
                keyboard.vertical *
                +!StartTimer.locked;

            // Calculate the steering direction using quaternion
            const steeringQuaternion = new CANNON.Quaternion();
            steeringQuaternion.setFromAxisAngle(
                new CANNON.Vec3(0, 1, 0),
                steeringAngle * 0.1 * player.context.deltaTime
            );

            // Apply steering by rotating the kart's quaternion
            player.quaternion.mult(steeringQuaternion, player.quaternion);

            // Optional: Apply angular damping to stabilize turning
            const angularDamping = 0.95;
            player.angularVelocity.scale(angularDamping, player.angularVelocity);

            putToGround();

            mushroomAddon = THREE.MathUtils.lerp(mushroomAddon, 0, player.context.deltaTime * 5);

            return [turboMode, driftSide[1], false, mushroomAddon] as [
                boolean,
                number,
                boolean,
                number
            ];
        };

        const rocketUpdate = () => {
            const { quaternion: ThreeQuaternion } =
                player.tracker.getPointTransform(player.position);
            const quaternion = new CANNON.Quaternion(
                ThreeQuaternion.x,
                ThreeQuaternion.y,
                ThreeQuaternion.z,
                ThreeQuaternion.w
            );
            player.quaternion.slerp(
                quaternion,
                player.context.deltaTime * 10,
                player.quaternion
            );

            const forward = new CANNON.Vec3(0, 0, 1);
            quaternion.vmult(forward, forward);

            const drivingForce = forward.scale(10);

            player.velocity.lerp(
                drivingForce,
                player.context.deltaTime * 7,
                player.velocity
            );

            driftSide[1] = driftSide[0] = 0;
            putToGround();

            return [false, 0, true, 0] as [boolean, number, boolean, number];
        };

        this.update = () => {
            const val = [keyboardUpdate, rocketUpdate][+rocketMode]();

            const velocityMagnitude = Math.abs(
                player.velocity.dot(
                    player.quaternion.vmult(new CANNON.Vec3(0, 0, 1))
                )
            );

            return val;
        };
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
            // shakeMode && player.model.shake(1000);

            // @ts-ignore typescripts make it setTimeout by nodejs insted of webapi
            rocketTimeoutID = setTimeout(() => {
                shakeMode = false;
            }, 1000);
        };
        this.rocket = (pos, quat) => {
            player.position.copy(pos);
            player.quaternion.copy(quat);
            rocketTimeoutID != undefined && clearTimeout(rocketTimeoutID);

            player.setRocketModel(true);
            rocketMode = true;

            // @ts-ignore typescripts make it setTimeout by nodejs insted of webapi
            rocketTimeoutID = setTimeout(() => {
                rocketMode = false;
                player.setRocketModel(false);
            }, 5000);
        };
        this.mushroom = () => {
            const forwardVec = player.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
            mushroomAddon = 1;
            player.applyImpulse(forwardVec.scale(40));
        };
    }
}
