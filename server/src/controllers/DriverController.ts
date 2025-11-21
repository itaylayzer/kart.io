import { PlayerEntity } from "@/entities/PlayerEntity";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { InputPayload } from "@shared/types/payloads";

const maxDistance = 1;
export class DriveController {
    public update: (input: InputPayload | null) => [boolean, number, boolean, number];
    public turbo: () => void;
    public shake: () => void;
    public rocket: (pos: CANNON.Vec3, quat: CANNON.Quaternion) => void;
    public mushroom: () => void;

    private steeringAngle = 0;
    private maxSteeringAngle = 15; // Limit steering angle (30 degrees)
    private raycaster = new THREE.Raycaster();
    private driftTime = 0;
    private driftSide = [0, 0];
    private speedTime = 0;
    private turboMode = false;
    private turboTimeoutID: ReturnType<typeof setTimeout> | undefined = undefined;
    private rocketTimeoutID: ReturnType<typeof setTimeout> | undefined = undefined;
    private rocketMode = false;
    private shakeMode = false;
    private mushroomAddon = 0;
    private gameStarted = false;

    constructor(
        public maxSpeed: number,
        private player: PlayerEntity,
    ) {

        const putToGround = () => {
            this.raycaster.set(
                new THREE.Vector3()
                    .copy(this.player.position)
                    .add(new THREE.Vector3(0, 0.2, 0)),
                new THREE.Vector3(0, -1, 0).applyQuaternion(this.player.quaternion)
            );
            const intercetions = this.raycaster.intersectObjects(this.player.context.roadMesh);

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
                    this.player.tracker.getPointTransform() as THREE.Object3D;

                const A = new THREE.Vector3()
                    .copy(this.player.position)
                    .sub(releventTransfer.position);
                const B = new THREE.Vector3(1, 0, 0).applyQuaternion(
                    releventTransfer.quaternion
                );

                let impulse = B.clone();

                if (A.dot(B) > 0) {
                    impulse.negate();
                }

                impulse.multiplyScalar(5);

                this.player.applyImpulse(
                    new CANNON.Vec3(impulse.x, impulse.y, impulse.z)
                );
                return;
            }

            // const up = closestIntersection.normal;

            const groundPoint = closestIntersection.point!;
            const groundNormal = closestIntersection.normal;

            // Adjust the kart's position to the ground
            this.player.position.y = groundPoint.y;

            if (groundNormal === undefined) return;

            // Convert the current up vector and ground normal to CANNON.Vec3
            const currentUp = this.player.quaternion.vmult(new CANNON.Vec3(0, 1, 0));
            const groundNormalCannon = new CANNON.Vec3(
                groundNormal.x,
                groundNormal.y,
                groundNormal.z
            );

            // Calculate the quaternion needed to align the up vector with the ground normal
            const alignUpQuat = new CANNON.Quaternion();
            alignUpQuat.setFromVectors(currentUp, groundNormalCannon);

            // Apply the alignment quaternion to the current quaternion
            this.player.quaternion = alignUpQuat.mult(this.player.quaternion);
        };

        const keyboardUpdate = (input: InputPayload | null) => {
            if (!input || !this.gameStarted) {
                // No input or game not started - apply friction only
                const velocity = this.player.velocity.clone();
                const frictionForce = velocity.scale(-2);
                this.player.force.copy(frictionForce);
                putToGround();
                return [this.turboMode, this.driftSide[1], this.rocketMode, this.mushroomAddon] as [
                    boolean,
                    number,
                    boolean,
                    number
                ];
            }

            // Handle drift
            if (input.drift) {
                this.driftSide[0] = input.horizontal * 1;
                this.driftTime = 0;
            }
            if (
                this.driftSide[0] !== 0 &&
                input.drift
            ) {
                this.driftTime += this.player.context.deltaTime;
            }
            if (!input.drift || this.driftTime > 3) {
                this.driftSide[0] = 0;
                if (this.driftTime > 3) this.driftTime = 0;
            }

            if (input.horizontal !== 0) {
                this.speedTime = 0;
            }
            this.speedTime += this.player.context.deltaTime;

            this.driftSide[1] = THREE.MathUtils.damp(
                this.driftSide[1],
                this.driftSide[0],
                1.5,
                this.player.context.deltaTime * 7
            );
            const driftSpeedMultiplier =
                this.driftTime < 1 ? Math.sqrt(this.driftTime) : 5;

            const timeSpeedMultiplier = THREE.MathUtils.clamp((this.speedTime - 1) / 3, 0, 5);

            // Determine forward direction
            const forward = new CANNON.Vec3(0, 0, 1);
            this.player.quaternion.vmult(forward, forward);

            // Apply forward/reverse force
            const drivingForce = forward.scale(
                input.vertical *
                (this.maxSpeed +
                    +this.turboMode * this.maxSpeed +
                    driftSpeedMultiplier +
                    timeSpeedMultiplier) *
                2 *
                (this.shakeMode ? 0 : 1)
            );
            // Calculate and apply friction (simplified)
            const velocity = this.player.velocity.clone();
            const frictionForce = velocity.scale(-2); // Adjust friction coefficient as needed

            // Combine driving force and friction
            const totalForce = drivingForce.vadd(frictionForce);

            this.player.force.copy(totalForce);

            // Steering mechanics
            this.steeringAngle =
                (input.horizontal + this.driftSide[1]) *
                this.maxSteeringAngle *
                input.vertical;

            // Calculate the steering direction using quaternion
            const steeringQuaternion = new CANNON.Quaternion();
            steeringQuaternion.setFromAxisAngle(
                new CANNON.Vec3(0, 1, 0),
                this.steeringAngle * 0.1 * this.player.context.deltaTime
            );

            // Apply steering by rotating the kart's quaternion
            this.player.quaternion.mult(steeringQuaternion, this.player.quaternion);

            // Optional: Apply angular damping to stabilize turning
            const angularDamping = 0.95;
            this.player.angularVelocity.scale(angularDamping, this.player.angularVelocity);

            putToGround();

            this.mushroomAddon = THREE.MathUtils.lerp(this.mushroomAddon, 0, this.player.context.deltaTime * 5);

            return [this.turboMode, this.driftSide[1], this.rocketMode, this.mushroomAddon] as [
                boolean,
                number,
                boolean,
                number
            ];
        };

        const rocketUpdate = (input: InputPayload | null) => {
            const { quaternion: ThreeQuaternion } =
                this.player.tracker.getPointTransform(this.player.position);
            const quaternion = new CANNON.Quaternion(
                ThreeQuaternion.x,
                ThreeQuaternion.y,
                ThreeQuaternion.z,
                ThreeQuaternion.w
            );
            this.player.quaternion.slerp(
                quaternion,
                this.player.context.deltaTime * 10,
                this.player.quaternion
            );

            const forward = new CANNON.Vec3(0, 0, 1);
            quaternion.vmult(forward, forward);

            const drivingForce = forward.scale(10);

            this.player.velocity.lerp(
                drivingForce,
                this.player.context.deltaTime * 7,
                this.player.velocity
            );

            this.driftSide[1] = this.driftSide[0] = 0;
            putToGround();

            return [false, 0, true, 0] as [boolean, number, boolean, number];
        };

        this.update = (input: InputPayload | null) => {
            const val = [keyboardUpdate, rocketUpdate][+this.rocketMode](input);
            return val;
        };
        this.turbo = () => {
            if (this.turboTimeoutID !== undefined) {
                clearTimeout(this.turboTimeoutID);
            }

            this.turboMode = true;
            // @ts-ignore typescripts make it setTimeout by nodejs insted of webapi
            this.turboTimeoutID = setTimeout(() => {
                this.turboMode = false;
            }, 5000);
        };
        this.shake = () => {
            this.shakeMode = !this.rocketMode;
            // @ts-ignore typescripts make it setTimeout by nodejs insted of webapi
            if (this.rocketTimeoutID !== undefined) {
                clearTimeout(this.rocketTimeoutID);
            }
            this.rocketTimeoutID = setTimeout(() => {
                this.shakeMode = false;
            }, 1000);
        };
        this.rocket = (pos, quat) => {
            this.player.position.copy(pos);
            this.player.quaternion.copy(quat);
            if (this.rocketTimeoutID !== undefined) {
                clearTimeout(this.rocketTimeoutID);
            }

            this.player.setRocketModel(true);
            this.rocketMode = true;

            // @ts-ignore typescripts make it setTimeout by nodejs insted of webapi
            this.rocketTimeoutID = setTimeout(() => {
                this.rocketMode = false;
                this.player.setRocketModel(false);
            }, 5000);
        };
        this.mushroom = () => {
            const forwardVec = this.player.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
            this.mushroomAddon = 1;
            this.player.applyImpulse(forwardVec.scale(40));
        };

        // Method to start the game (enable movement)
        this.setGameStarted = (started: boolean) => {
            this.gameStarted = started;
        };
    }

    public setGameStarted: (started: boolean) => void;
}
