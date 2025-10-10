import { InputSystem } from "@/systems/InputSystem";
import { StatePayload, InputPayload } from "@shared/types/payloads";
import { Vector3 } from "three";

const SPEED = 150;

const sumVectors = (vectors: Vector3[]) => {
    const size = vectors.length;
    const sum = vectors.shift()!;

    while (vectors.length > 0) {
        sum.add(vectors.shift()!);
    }

    sum.divideScalar(size);

    return sum;
};

export class PredictionController {
    // Object
    private position: Vector3 = new Vector3(0, 0, 0);
    public latestStatedPosition: Vector3 = new Vector3(0, 0, 0);
    private inputs: Vector3[] = [];

    // Input system
    private keySet: Set<number> = new Set();

    // Shared
    private readonly SERVER_TICK_RATE = 20;
    private readonly BUFFER_SIZE = 1024;

    private timer: number = 0;
    private currentTick: number = 0;
    private minTimeBetweenTicks: number = 1.0 / this.SERVER_TICK_RATE;

    // Client specific
    private stateBuffer: (StatePayload | null)[] = Array(this.BUFFER_SIZE).fill(
        null
    );
    private inputBuffer: (InputPayload | null)[] = Array(this.BUFFER_SIZE).fill(
        null
    );
    private latestServerState: StatePayload | null = null;
    private lastProcessedState: StatePayload | null = null;

    constructor(private sendToServer: (payload: InputPayload) => void) { }

    update = (dt: number) => {
        this.timer += dt;

        this.handleMovement(dt);

        while (this.timer >= this.minTimeBetweenTicks) {
            this.timer -= this.minTimeBetweenTicks;
            this.handleTick(dt);
            this.currentTick++;
        }

        return this.position.clone();
    };

    onServerMovementState = (serverState: StatePayload) => {
        this.latestServerState = serverState;
        if (this.lastProcessedState === null) {
            this.lastProcessedState = this.latestServerState;
        }
    };

    private handleTick = (dt: number) => {
        if (
            this.latestServerState !== null &&
            this.lastProcessedState !== null &&
            new Vector3()
                .copy(this.latestServerState.position)
                .distanceTo(
                    new Vector3().copy(this.lastProcessedState.position)
                ) > 0
        ) {
            this.handleServerReconciliation();
        }

        let bufferIndex = this.currentTick % this.BUFFER_SIZE;
        const inputPayload = {
            tick: this.currentTick,
            inputVector: sumVectors(this.inputs),
        } as InputPayload;

        this.inputBuffer[bufferIndex] = inputPayload;
        this.stateBuffer[bufferIndex] = this.processMovement(inputPayload);

        this.sendToServer(inputPayload);
    };

    // Logic
    private processMovement = (
        input: InputPayload,
        ms: number = this.minTimeBetweenTicks
    ) => {
        this.latestStatedPosition.add(
            new Vector3().copy(input.inputVector).multiplyScalar(SPEED * ms)
        );

        return {
            position: this.latestStatedPosition.clone(),
            tick: input.tick,
        } as StatePayload;
    };

    // TODO: this function will handle movement when not server tick hit!
    private handleMovement = (dt: number) => {
        const { horizontal, vertical } = InputSystem.getAxis([
            "vertical",
            "horizontal",
        ]);
        const inputPayload = new Vector3(horizontal, 0, -vertical);

        this.inputs.push(inputPayload.clone());
        this.position.add(inputPayload.multiplyScalar(SPEED * dt));
    };

    private handleServerReconciliation = () => {
        this.lastProcessedState = this.latestServerState;
        let serverStateBufferIndex =
            this.latestServerState!.tick % this.BUFFER_SIZE;
        const positionError = new Vector3()
            .copy(this.latestServerState!.position)
            .distanceTo(
                new Vector3().copy(
                    this.stateBuffer[serverStateBufferIndex]!.position
                )
            );

        if (positionError > 0.001) {
            console.log("We have to reconcile bro");

            this.position.copy(this.latestServerState!.position);

            this.stateBuffer[serverStateBufferIndex] = this.latestServerState!;

            let tickToProcess = this.latestServerState!.tick + 1;

            while (tickToProcess < this.currentTick) {
                let bufferIndex = tickToProcess % this.BUFFER_SIZE;

                this.stateBuffer[bufferIndex] = this.processMovement(
                    this.inputBuffer[bufferIndex]!
                );

                tickToProcess++;
            }
        }
    };
}
