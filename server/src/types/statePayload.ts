import { Vector3Like } from "three";

export type StatePayload = {
    tick: number;
    position: Vector3Like;
};