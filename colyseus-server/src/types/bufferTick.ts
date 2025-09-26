import { Vector2, Vector3 } from "three";

export type BufferTick = {
    position: Vector3;
    input: Vector2;
    velocity: Vector3;
    euler: Vector3;
    tickIndex: number;
}