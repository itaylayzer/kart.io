import { InputPayload, StatePayload } from "@shared/types/payloads";
import { Vector3, Vector3Like } from "three";
import { PlayerEntity } from "@/entities/PlayerEntity";
import * as CANNON from "cannon-es";

export class SyncedMovementController {
    // Shared
    private readonly SERVER_TICK_RATE = 20;
    private readonly BUFFER_SIZE = 1024;

    private timer: number = 0;
    private currentTick: number = 0;
    private minTimeBetweenTicks: number = 1.0 / this.SERVER_TICK_RATE;

    private stateBuffer: (StatePayload | null)[] = Array(this.BUFFER_SIZE).fill(null);
    private inputQueue: InputPayload[] = [];
    private lastProcessedInput: InputPayload | null = null;

    constructor(
        public sessionId: string,
        private playerEntity: PlayerEntity,
        private sendToClient: (state: StatePayload) => void
    ) { }

    update = (dt: number) => {
        this.timer += dt;

        let handledTick = false;

        while (this.timer >= this.minTimeBetweenTicks) {
            this.timer -= this.minTimeBetweenTicks;
            this.handleTick();
            handledTick = true;
        }

        return handledTick;
    };

    onClientInput(inputPayload: InputPayload) {
        // Insert input in order by tick
        let insertIndex = this.inputQueue.length;
        for (let i = 0; i < this.inputQueue.length; i++) {
            if (this.inputQueue[i].tick > inputPayload.tick) {
                insertIndex = i;
                break;
            }
        }
        this.inputQueue.splice(insertIndex, 0, inputPayload);
    }

    private handleTick = () => {
        // Process inputs up to current tick
        let inputToProcess: InputPayload | null = null;
        
        while (this.inputQueue.length > 0 && this.inputQueue[0].tick <= this.currentTick) {
            inputToProcess = this.inputQueue.shift()!;
        }

        // Use last processed input if no new input available (input prediction)
        if (inputToProcess === null && this.lastProcessedInput !== null) {
            inputToProcess = this.lastProcessedInput;
        }

        // Update player with input
        const [turboMode, driftSide, rocketMode, mushroomAddon] = 
            this.playerEntity.engine.update(inputToProcess);

        // Create state payload
        const statePayload: StatePayload = {
            tick: this.currentTick,
            position: {
                x: this.playerEntity.position.x,
                y: this.playerEntity.position.y,
                z: this.playerEntity.position.z,
            },
            quaternion: {
                x: this.playerEntity.quaternion.x,
                y: this.playerEntity.quaternion.y,
                z: this.playerEntity.quaternion.z,
                w: this.playerEntity.quaternion.w,
            },
            velocity: {
                x: this.playerEntity.velocity.x,
                y: this.playerEntity.velocity.y,
                z: this.playerEntity.velocity.z,
            },
            turboMode,
            rocketMode,
            driftSide,
            mushroomAddon,
        };

        // Store state in buffer
        const bufferIndex = this.currentTick % this.BUFFER_SIZE;
        this.stateBuffer[bufferIndex] = statePayload;

        // Send to client
        this.sendToClient(statePayload);

        // Update last processed input
        if (inputToProcess !== null) {
            this.lastProcessedInput = inputToProcess;
        }

        this.currentTick++;
    };

    getCurrentTick(): number {
        return this.currentTick;
    }
}
