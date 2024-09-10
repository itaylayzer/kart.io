import * as CANNON from "cannon-es";
import { Global } from "../store/Global";

import * as THREE from "three";
import { damp } from "three/src/math/MathUtils.js";
import { IKeyboardController } from "./IKeyboardController";
import clamp from "../api/clamp";
import { AudioController } from "./AudioController";
import { Player } from "../player/Player";

const maxDistance = 1;
export class DriveController {
    private steeringAngle: number;
    private readonly maxSteeringAngle: number;
    private raycaster: THREE.Raycaster;
    private last: CANNON.Vec3;
    private driftSide: [number, number];
    private driftTime: number;
    private speedTime: number;

    constructor(
        public maxSpeed: number,
        private body: Player,
        private keyboard: IKeyboardController,
        private audio: AudioController,

        private islocal: boolean
    ) {
        this.steeringAngle = 0;
        this.maxSteeringAngle = 15; // Limit steering angle (30 degrees)
        this.raycaster = new THREE.Raycaster();
        this.last = new CANNON.Vec3();
        this.driftTime = 0;
        this.driftSide = [0, 0];
        this.speedTime = 0;
    }

    putToGround() {
        this.raycaster.set(
            new THREE.Vector3()
                .copy(this.body.position)
                .add(new THREE.Vector3(0, 0.2, 0)),
            new THREE.Vector3(0, -1, 0).applyQuaternion(this.body.quaternion)
        );
        const intercetions = this.raycaster.intersectObjects(Global.roadMesh);

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
                this.body.tracker.getPointTransform() as THREE.Object3D;

            const A = new THREE.Vector3()
                .copy(this.body.position)
                .sub(releventTransfer.position);
            const B = new THREE.Vector3(1, 0, 0).applyQuaternion(
                releventTransfer.quaternion
            );

            let impulse = B.clone();

            if (A.dot(B) > 0) {
                impulse.negate();
            }

            impulse.multiplyScalar(5);

            this.body.applyImpulse(
                new CANNON.Vec3(impulse.x, impulse.y, impulse.z)
            );
            return;
        }
        this.last.copy(this.body.position);

        // const up = closestIntersection.normal;

        const groundPoint = closestIntersection.point!;
        const groundNormal = closestIntersection.normal;

        // Adjust the kart's position to the ground
        this.body.position.y = groundPoint.y;

        if (groundNormal === undefined) return;

        // Convert the current up vector and ground normal to CANNON.Vec3
        const currentUp = this.body.quaternion.vmult(new CANNON.Vec3(0, 1, 0));
        const groundNormalCannon = new CANNON.Vec3(
            groundNormal.x,
            groundNormal.y,
            groundNormal.z
        );

        // Calculate the quaternion needed to align the up vector with the ground normal
        const alignUpQuat = new CANNON.Quaternion();
        alignUpQuat.setFromVectors(currentUp, groundNormalCannon);

        // Apply the alignment quaternion to the current quaternion
        this.body.quaternion = alignUpQuat.mult(this.body.quaternion);
    }

    calculateRoadDistances() {
        const pos = new THREE.Vector3().copy(this.body.position);
        const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(
            this.body.quaternion
        );
        const downVec = new THREE.Vector3(0, -1, 0).applyQuaternion(
            this.body.quaternion
        );
        const upVec = new THREE.Vector3(0, 1, 0).applyQuaternion(
            this.body.quaternion
        );
        const treshold = 0.1;

        const getPos = (middle: number) =>
            pos
                .clone()
                .add(
                    rightVec
                        .clone()
                        .multiplyScalar(middle)
                        .add(upVec.clone().multiplyScalar(0.25))
                );

        const compare = (middle: number) => {
            this.raycaster.set(getPos(middle), downVec);

            const intersects = this.raycaster.intersectObjects(Global.roadMesh);

            return (
                intersects.length > 0 &&
                intersects.reduce((a, b) => (a.distance > b.distance ? b : a))
                    .distance <= maxDistance
            );
        };

        const findDistancePos = (left: number, right: number) => {
            const rightOrigin = right === 0;
            let middle = (right + left) / 2;
            while (Math.abs(right - left) > treshold) {
                middle = (right + left) / 2;
                if (compare(middle)) {
                    rightOrigin ? (right = middle) : (left = middle);
                } else {
                    rightOrigin ? (left = middle) : (right = middle);
                }
            }

            return middle;
        };

        const positions = [findDistancePos(-25, 0), findDistancePos(0, 25)];

        return positions;
    }

    update() {
        if (this.keyboard.isKeyDown(32) || this.keyboard.isKeyDown(-6)) {
            this.driftSide[0] = this.keyboard.horizontalRaw * 1;
            this.driftTime = 0;
        }
        if (
            this.driftSide[0] !== 0 &&
            (this.keyboard.isKeyPressed(32) || this.keyboard.isKeyPressed(-6))
        ) {
            this.driftTime += Global.deltaTime;
        }
        if (this.keyboard.isKeyUp(32) || this.keyboard.isKeyUp(-6)) {
            this.driftSide[0] = 0;
            this.driftTime = 0;
        }

        if (this.keyboard.horizontalRaw !== 0) {
            this.speedTime = 0;
        }
        this.speedTime += Global.deltaTime;

        this.driftSide[1] = damp(
            this.driftSide[1],
            this.driftSide[0],
            1.5,
            Global.deltaTime * 7
        );

        const driftSpeedMultiplier =
            this.driftTime < 1 ? Math.sqrt(this.driftTime) : 5;

        const timeSpeedMultiplier = clamp((this.speedTime - 1) / 3, 0, 5);

        // Determine forward direction
        const forward = new CANNON.Vec3(0, 0, 1);
        this.body.quaternion.vmult(forward, forward);

        // Apply forward/reverse force
        const drivingForce = forward.scale(
            this.keyboard.vertical *
                (this.maxSpeed + driftSpeedMultiplier + timeSpeedMultiplier) *
                2
        );

        // Calculate and apply friction (simplified)
        const velocity = this.body.velocity.clone();
        const frictionForce = velocity.scale(-2); // Adjust friction coefficient as needed

        // Combine driving force and friction
        const totalForce = drivingForce.vadd(frictionForce);
        this.body.force.copy(totalForce);

        // Steering mechanics
        this.steeringAngle =
            (this.keyboard.horizontal + this.driftSide[1]) *
            this.maxSteeringAngle *
            this.keyboard.vertical;

        // Calculate the steering direction using quaternion
        const steeringQuaternion = new CANNON.Quaternion();
        steeringQuaternion.setFromAxisAngle(
            new CANNON.Vec3(0, 1, 0),
            this.steeringAngle * 0.1 * Global.deltaTime
        );

        // Apply steering by rotating the kart's quaternion
        this.body.quaternion.mult(steeringQuaternion, this.body.quaternion);

        // Optional: Apply angular damping to stabilize turning
        const angularDamping = 0.95;
        this.body.angularVelocity.scale(
            angularDamping,
            this.body.angularVelocity
        );

        this.putToGround();

        const velocityMagnitude = Math.abs(
            this.body.velocity.dot(
                this.body.quaternion.vmult(new CANNON.Vec3(0, 0, 1))
            )
        );

        this.islocal &&
            Global.settings.displayVelocity &&
            (document.querySelector(
                "p#velocity"
            )!.innerHTML = `${velocityMagnitude.toFixed(2)} KM/S`);

        this.audio.update(velocityMagnitude);
    }
}
