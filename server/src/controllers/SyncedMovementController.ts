import { InputPayload, StatePayload } from "@shared/types/payloads";
import { Vector3, Vector3Like } from "three";

const SPEED = 150;

export class SyncedMovementController {
    private position = new Vector3(0, 0, 0);

    // Shared
    private readonly SERVER_TICK_RATE = 20;
    private readonly BUFFER_SIZE = 1024;

    private timer: number = 0;
    private currentTick: number = 0;
    private minTimeBetweenTicks: number = 1.0 / this.SERVER_TICK_RATE;

    private stateBuffer: StatePayload[] = Array(this.BUFFER_SIZE).fill(null);
    private inputQueue: InputPayload[] = [];

    constructor(
        public sessionId: string,
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

        return [handledTick, this.position.clone(), this.currentTick] as [
            boolean,
            Vector3Like,
            number
        ];
    };

    onClientInput(inputPayload: InputPayload) {
        this.inputQueue.push(inputPayload);
    }

    private handleTick = () => {
        let bufferIndex = -1;
        while (this.inputQueue.length > 0) {
            const inputPayload = this.inputQueue.shift()!;

            bufferIndex = inputPayload.tick % this.BUFFER_SIZE;
            this.currentTick = inputPayload.tick;
            this.stateBuffer[bufferIndex] = this.processMovement(inputPayload);
        }

        if (bufferIndex != -1) {
            this.sendToClient(this.stateBuffer[bufferIndex]);
        }
    };

    // Logic
    private processMovement = (input: InputPayload) => {
        this.position.add(
            new Vector3()
                .copy(input.inputVector)
                .multiplyScalar(SPEED * this.minTimeBetweenTicks)
        );

        return { position: this.position, tick: input.tick } as StatePayload;
    };
}
