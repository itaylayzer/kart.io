type Vector3Like = { x: number; y: number; z: number };

export type InputPayload = {
    tick: number;
    inputVector: Vector3Like;
};

export type StatePayload = {
    tick: number;
    position: Vector3Like;
};
