// Utility types
type LerpFn<T> = (a: T, b: T, t: number) => T;

abstract class NetworkInterpolation<T> {
    private buffer: { timestamp: number; value: T }[] = [];
    private lastOutput!: T;
    private lastTime: number = 0;
    private interpFn: LerpFn<T>;
    private maxBufferTime = 500; // ms
    private correctionThreshold = 0.1; // 10%

    constructor(interpFn: LerpFn<T>, private nowFn = () => Date.now()) {
        this.interpFn = interpFn;
    }

    /** Receive new network value */
    set(value: T, timestamp?: number) {
        const ts = timestamp ?? this.nowFn();
        this.buffer.push({ timestamp: ts, value });
        // Keep buffer within reasonable size/time
        const cutoff = ts - this.maxBufferTime;
        this.buffer = this.buffer.filter((p) => p.timestamp >= cutoff);

        if (this.buffer.length === 1) {
            this.lastOutput = value;
            this.lastTime = ts;
        }
    }

    /** Retrieve interpolated value at current time */
    get(): T {
        const now = this.nowFn();

        if (this.buffer.length === 0) {
            return this.lastOutput;
        }
        // Remove any outdated buffer entries
        while (this.buffer.length > 2 && this.buffer[1].timestamp <= now) {
            this.buffer.shift();
        }

        const { timestamp: t0, value: v0 } = this.buffer[0];
        const next = this.buffer[1];
        if (!next) {
            // No next: maybe just one value
            const out = this.extrapolate(v0, now - t0);
            this.lastOutput = out;
            this.lastTime = now;

            return out;
        }
        const { timestamp: t1, value: v1 } = next;
        const alpha = t1 !== t0 ? (now - t1) / (t1 - t0) : 1;
        // Correct if too laggy or overshoot
        if (alpha < 0 || alpha > 1 + this.correctionThreshold) {
            const corrected = v1;
            this.lastOutput = corrected;
            this.lastTime = now;
            return corrected;
        }

        const interpolated = this.interpFn(
            v0,
            v1,
            Math.min(Math.max(alpha, 0), 1)
        );
        this.lastOutput = interpolated;
        this.lastTime = now;
        return interpolated;
    }

    getLast(): T {
        return this.buffer.at(-1)?.value ?? this.lastOutput;
    }

    /** Optional linear extrapolation for single-sample cases */
    protected extrapolate(v0: T, dt: number): T {
        return v0;
    }
}
import { Vector3 } from "three";

export class Vector3Interpolation extends NetworkInterpolation<Vector3> {
    constructor() {
        super((a, b, t) => a.clone().lerp(b, t));
    }

    protected extrapolate(v0: Vector3, dt: number): Vector3 {
        // no velocity data available for plain extrapolation
        return v0.clone();
    }
}
import { Quaternion } from "three";

export class QuaternionInterpolation extends NetworkInterpolation<Quaternion> {
    constructor() {
        super((a, b, t) => a.clone().slerp(b, t));
    }

    protected extrapolate(v0: Quaternion, dt: number): Quaternion {
        return v0.clone();
    }
}
