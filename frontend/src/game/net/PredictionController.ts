import { Body } from "cannon-es";
import { Vector3, Quaternion } from "three";
import { Global } from "../store/Global";
import { InputPayload, StatePayload } from "@shared/types/payloads";
import { KCS, KCC } from "../store/codes";
import { IKeyboardController } from "../controller/IKeyboardController";
import { Player } from "../player/Player";

const TICK_RATE = 60;
const BUFFER_SIZE = 2048;
const POSITION_THRESHOLD = 0.15;
const RECONCILE_BLEND = 0.35;

export class PredictionController {
    private currentTick = 0;
    private inputBuffer: Array<InputPayload | null> = new Array(BUFFER_SIZE).fill(null);
    private stateBuffer: Array<StatePayload | null> = new Array(BUFFER_SIZE).fill(null);
    private latestServerState: StatePayload | null = null;
    private body: Body | null = null;

    constructor(private readonly pid: number, private readonly keyboard: IKeyboardController) {
        Global.client.onMessage(KCC.STATE_BUFFER, (state: StatePayload) => {
            if (state.pid === this.pid) {
                this.latestServerState = state;
                this.reconcile(state);
                return;
            }

            const remote = Player.clients.get(state.pid);
            if (remote) {
                remote.position.set(state.position.x, state.position.y, state.position.z);
                remote.quaternion.set(
                    state.quaternion.x,
                    state.quaternion.y,
                    state.quaternion.z,
                    state.quaternion.w,
                );
            }
        });
    }

    update(body: Body) {
        if (!this.body) {
            this.body = body;
        }

        const input: InputPayload = {
            tick: this.currentTick,
            inputVector: { x: this.keyboard.horizontal, y: this.keyboard.vertical },
        };

        const snapshot: StatePayload = {
            pid: this.pid,
            tick: this.currentTick,
            position: {
                x: body.position.x,
                y: body.position.y,
                z: body.position.z,
            },
            quaternion: {
                x: body.quaternion.x,
                y: body.quaternion.y,
                z: body.quaternion.z,
                w: body.quaternion.w,
            },
        };

        const index = this.currentTick % BUFFER_SIZE;
        this.inputBuffer[index] = input;
        this.stateBuffer[index] = snapshot;

        Global.client.send(KCS.INPUT_BUFFER, input);
        this.currentTick += 1;
    }

    private reconcile(server: StatePayload) {
        if (!this.body) return;

        const body = this.body;
        const targetPos = new Vector3(server.position.x, server.position.y, server.position.z);
        const currentPos = new Vector3(body.position.x, body.position.y, body.position.z);
        const error = currentPos.distanceTo(targetPos);

        if (error < POSITION_THRESHOLD) {
            return;
        }

        const blended = currentPos.lerp(targetPos, RECONCILE_BLEND);
        body.position.set(blended.x, blended.y, blended.z);

        const currentQuat = new Quaternion(
            body.quaternion.x,
            body.quaternion.y,
            body.quaternion.z,
            body.quaternion.w,
        );
        const targetQuat = new Quaternion(
            server.quaternion.x,
            server.quaternion.y,
            server.quaternion.z,
            server.quaternion.w,
        );
        currentQuat.slerp(targetQuat, RECONCILE_BLEND);
        body.quaternion.set(currentQuat.x, currentQuat.y, currentQuat.z, currentQuat.w);
    }
}
