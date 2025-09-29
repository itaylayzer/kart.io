import {
    Body,
    Cylinder,
    Material,
    Quaternion as CQuaternion,
    Vec3,
    World,
} from "cannon-es";
import { Mesh, Quaternion, Raycaster, Vector3 } from "three";
import { InputPayload, StatePayload } from "@shared/types/payloads";

const SERVER_TICK_RATE = 60;
const BUFFER_SIZE = 2048;

export class PlayerEntity {
    public readonly body: Body;
    public pid!: number;

    private inputBuffer: Array<InputPayload | null> = new Array(BUFFER_SIZE).fill(null);
    private stateBuffer: Array<StatePayload | null> = new Array(BUFFER_SIZE).fill(null);

    private tick = 0;
    private readonly dt = 1 / SERVER_TICK_RATE;

    private raycaster = new Raycaster();
    private tmpVec = new Vector3();
    private tmpQuat = new Quaternion();
    private forward = new Vec3(0, 0, 1);
    private isAdded = false;

    constructor(
        private readonly world: World,
        private readonly roadMeshes: Mesh[],
    ) {
        const radius = 0.8 / 3;
        this.body = new Body({
            mass: 1,
            material: new Material({ friction: 0, restitution: 0 }),
            position: new Vec3(0, 1, 0),
            collisionFilterGroup: 1,
            collisionFilterMask: ~0,
        });
        this.body.addShape(new Cylinder(radius, radius, radius));
        (this.body as any).isPlayer = true;
    }

    spawn(pid: number, position: Vector3, quaternion: { x: number; y: number; z: number; w: number }) {
        this.pid = pid;
        this.tick = 0;
        this.setTransform(position, quaternion);
        (this.body as any).pid = pid;
        if (!this.isAdded) {
            this.world.addBody(this.body);
            this.isAdded = true;
        }
    }

    dispose() {
        if (this.isAdded) {
            this.world.removeBody(this.body);
            this.isAdded = false;
        }
    }

    onInput(payload: InputPayload) {
        this.inputBuffer[payload.tick % BUFFER_SIZE] = payload;
    }

    processInput(tick: number) {
        const payload = this.inputBuffer[tick % BUFFER_SIZE];
        const inputX = payload?.inputVector.x ?? 0;
        const inputY = payload?.inputVector.y ?? 0;
        const accel = 45;
        const steer = 2.5;
        const damping = 0.15;

        this.forward.set(0, 0, 1);
        this.body.quaternion.vmult(this.forward, this.forward);

        const thrust = accel * inputY;
        const force = new Vec3(this.forward.x * thrust, this.forward.y * thrust, this.forward.z * thrust);
        this.body.force.vadd(force, this.body.force);

        const yawDelta = steer * inputX * this.dt;
        if (Math.abs(yawDelta) > 1e-6) {
            const yawQuat = new CQuaternion();
            yawQuat.setFromAxisAngle(new Vec3(0, 1, 0), yawDelta);
            this.body.quaternion = yawQuat.mult(this.body.quaternion);
        }

        this.body.velocity.scale(1 - damping * this.dt, this.body.velocity);

        this.alignToGround();
    }

    afterPhysicsStep() {
        const state: StatePayload = {
            pid: this.pid,
            tick: this.tick,
            position: {
                x: this.body.position.x,
                y: this.body.position.y,
                z: this.body.position.z,
            },
            quaternion: {
                x: this.body.quaternion.x,
                y: this.body.quaternion.y,
                z: this.body.quaternion.z,
                w: this.body.quaternion.w,
            },
        };

        this.stateBuffer[this.tick % BUFFER_SIZE] = state;
        this.tick += 1;
    }

    getState(tick: number) {
        return this.stateBuffer[tick % BUFFER_SIZE];
    }

    getTick() {
        return this.tick;
    }

    setTransform(position: Vector3, quaternion: { x: number; y: number; z: number; w: number }) {
        this.body.position.set(position.x, position.y, position.z);
        this.body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        this.body.velocity.set(0, 0, 0);
        this.body.angularVelocity.set(0, 0, 0);
    }

    private alignToGround() {
        const origin = this.tmpVec.set(
            this.body.position.x,
            this.body.position.y + 1,
            this.body.position.z,
        );
        this.raycaster.set(origin, new Vector3(0, -1, 0));
        const hits = this.raycaster.intersectObjects(this.roadMeshes, false);
        if (hits.length === 0) {
            return;
        }

        const hit = hits[0];
        if (!hit.face) return;

        const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
        const currentUp = new Vector3(0, 1, 0).applyQuaternion(
            this.tmpQuat.set(
                this.body.quaternion.x,
                this.body.quaternion.y,
                this.body.quaternion.z,
                this.body.quaternion.w,
            ),
        );

        const axis = new Vector3().crossVectors(currentUp, normal);
        const angle = axis.length();
        if (angle < 1e-3) {
            return;
        }

        axis.normalize();
        const correction = new Quaternion().setFromAxisAngle(axis, angle * 0.3);
        const corrected = correction.multiply(this.tmpQuat);
        this.body.quaternion.set(corrected.x, corrected.y, corrected.z, corrected.w);
    }
}
