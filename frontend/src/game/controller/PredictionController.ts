import { InputSystem } from "@/systems/InputSystem";
import { StatePayload, InputPayload } from "@shared/types/payloads";
import { Vector3, Quaternion } from "three";

export class PredictionController {
    // Object state (for client prediction)
    private position: Vector3 = new Vector3(0, 0, 0);
    private quaternion: Quaternion = new Quaternion();
    private velocity: Vector3 = new Vector3(0, 0, 0);
    public latestStatedPosition: Vector3 = new Vector3(0, 0, 0);
    private latestStatedQuaternion: Quaternion = new Quaternion();
    private latestStatedVelocity: Vector3 = new Vector3(0, 0, 0);
    
    // Input tracking
    private recentInputs: Array<{ horizontal: number; vertical: number; drift: boolean }> = [];

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

        // Collect input every frame
        this.collectInput();

        while (this.timer >= this.minTimeBetweenTicks) {
            this.timer -= this.minTimeBetweenTicks;
            this.handleTick();
            this.currentTick++;
        }

        // Interpolate between predicted state and server state for smooth rendering
        return {
            position: this.position.clone(),
            quaternion: this.quaternion.clone(),
            velocity: this.velocity.clone(),
        };
    };

    onServerMovementState = (serverState: StatePayload) => {
        this.latestServerState = serverState;
        if (this.lastProcessedState === null) {
            this.lastProcessedState = this.latestServerState;
        }
    };

    private handleTick = () => {
        // Check for reconciliation if we have server state
        if (
            this.latestServerState !== null &&
            this.lastProcessedState !== null &&
            new Vector3()
                .copy(this.latestServerState.position)
                .distanceTo(
                    new Vector3().copy(this.lastProcessedState.position)
                ) > 0.001
        ) {
            this.handleServerReconciliation();
        }

        // Get average input from recent inputs
        const avgInput = this.getAverageInput();
        
        let bufferIndex = this.currentTick % this.BUFFER_SIZE;
        const inputPayload: InputPayload = {
            tick: this.currentTick,
            horizontal: avgInput.horizontal,
            vertical: avgInput.vertical,
            drift: avgInput.drift,
        };

        this.inputBuffer[bufferIndex] = inputPayload;
        this.stateBuffer[bufferIndex] = this.processMovement(inputPayload);

        this.sendToServer(inputPayload);
        
        // Clear recent inputs after processing
        this.recentInputs = [];
    };

    // Collect input from InputSystem
    private collectInput = () => {
        const { horizontal, vertical } = InputSystem.getAxis([
            "horizontal",
            "vertical",
        ]);
        const drift = InputSystem.onTriggerPressed("jump");
        
        this.recentInputs.push({ horizontal, vertical, drift });
        
        // Keep only recent inputs (last frame's worth)
        if (this.recentInputs.length > 10) {
            this.recentInputs.shift();
        }
    };

    // Get average input from recent inputs
    private getAverageInput = () => {
        if (this.recentInputs.length === 0) {
            return { horizontal: 0, vertical: 0, drift: false };
        }
        
        const sum = this.recentInputs.reduce(
            (acc, input) => ({
                horizontal: acc.horizontal + input.horizontal,
                vertical: acc.vertical + input.vertical,
                drift: acc.drift || input.drift,
            }),
            { horizontal: 0, vertical: 0, drift: false }
        );
        
        return {
            horizontal: sum.horizontal / this.recentInputs.length,
            vertical: sum.vertical / this.recentInputs.length,
            drift: sum.drift,
        };
    };

    // Process movement for prediction (simplified - server does the real work)
    private processMovement = (
        input: InputPayload,
        ms: number = this.minTimeBetweenTicks
    ) => {
        // Simple prediction - server will do the real physics
        // This is just for visual prediction
        const forward = new Vector3(0, 0, 1).applyQuaternion(this.latestStatedQuaternion);
        const move = forward.multiplyScalar(input.vertical * 5 * ms);
        this.latestStatedPosition.add(move);
        
        // Simple rotation prediction
        const rotation = input.horizontal * 0.1 * ms;
        this.latestStatedQuaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), rotation));

        // Update visual position/quaternion for rendering
        this.position.lerp(this.latestStatedPosition, 0.1);
        this.quaternion.slerp(this.latestStatedQuaternion, 0.1);

        return {
            position: this.latestStatedPosition.clone(),
            quaternion: {
                x: this.latestStatedQuaternion.x,
                y: this.latestStatedQuaternion.y,
                z: this.latestStatedQuaternion.z,
                w: this.latestStatedQuaternion.w,
            },
            velocity: this.latestStatedVelocity.clone(),
            tick: input.tick,
            turboMode: false,
            rocketMode: false,
            driftSide: 0,
            mushroomAddon: 0,
        } as StatePayload;
    };

    private handleServerReconciliation = () => {
        this.lastProcessedState = this.latestServerState;
        let serverStateBufferIndex =
            this.latestServerState!.tick % this.BUFFER_SIZE;
        
        if (this.stateBuffer[serverStateBufferIndex] === null) {
            // No prediction for this tick, just accept server state
            this.position.copy(this.latestServerState!.position);
            this.quaternion.set(
                this.latestServerState!.quaternion.x,
                this.latestServerState!.quaternion.y,
                this.latestServerState!.quaternion.z,
                this.latestServerState!.quaternion.w
            );
            this.velocity.copy(this.latestServerState!.velocity);
            this.latestStatedPosition.copy(this.latestServerState!.position);
            this.latestStatedQuaternion.set(
                this.latestServerState!.quaternion.x,
                this.latestServerState!.quaternion.y,
                this.latestServerState!.quaternion.z,
                this.latestServerState!.quaternion.w
            );
            this.latestStatedVelocity.copy(this.latestServerState!.velocity);
            return;
        }

        const positionError = new Vector3()
            .copy(this.latestServerState!.position)
            .distanceTo(
                new Vector3().copy(
                    this.stateBuffer[serverStateBufferIndex]!.position
                )
            );

        if (positionError > 0.001) {
            console.log("Reconciliation needed - position error:", positionError);

            // Rewind to server state
            this.position.copy(this.latestServerState!.position);
            this.quaternion.set(
                this.latestServerState!.quaternion.x,
                this.latestServerState!.quaternion.y,
                this.latestServerState!.quaternion.z,
                this.latestServerState!.quaternion.w
            );
            this.velocity.copy(this.latestServerState!.velocity);
            this.latestStatedPosition.copy(this.latestServerState!.position);
            this.latestStatedQuaternion.set(
                this.latestServerState!.quaternion.x,
                this.latestServerState!.quaternion.y,
                this.latestServerState!.quaternion.z,
                this.latestServerState!.quaternion.w
            );
            this.latestStatedVelocity.copy(this.latestServerState!.velocity);

            // Update buffer with server state
            this.stateBuffer[serverStateBufferIndex] = this.latestServerState!;

            // Re-apply all inputs after the server tick
            let tickToProcess = this.latestServerState!.tick + 1;

            while (tickToProcess < this.currentTick) {
                let bufferIndex = tickToProcess % this.BUFFER_SIZE;
                
                if (this.inputBuffer[bufferIndex] !== null) {
                    this.stateBuffer[bufferIndex] = this.processMovement(
                        this.inputBuffer[bufferIndex]!
                    );
                }

                tickToProcess++;
            }
        } else {
            // Small error, just update latest state
            this.latestStatedPosition.copy(this.latestServerState!.position);
            this.latestStatedQuaternion.set(
                this.latestServerState!.quaternion.x,
                this.latestServerState!.quaternion.y,
                this.latestServerState!.quaternion.z,
                this.latestServerState!.quaternion.w
            );
            this.latestStatedVelocity.copy(this.latestServerState!.velocity);
        }
    };
}
