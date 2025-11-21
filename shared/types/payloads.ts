type Vector3Like = { x: number; y: number; z: number };
type QuaternionLike = { x: number; y: number; z: number; w: number };

export type InputPayload = {
    tick: number;
    horizontal: number;  // -1 to 1, steering input
    vertical: number;     // -1 to 1, acceleration/brake
    drift: boolean;       // Space bar / drift key
};

export type StatePayload = {
    tick: number;
    position: Vector3Like;
    quaternion: QuaternionLike;
    velocity: Vector3Like;
    turboMode: boolean;
    rocketMode: boolean;
    driftSide: number;
    mushroomAddon: number;
};
