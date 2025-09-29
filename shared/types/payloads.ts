export type Vec2 = { x: number; y: number };
export type Vec3 = { x: number; y: number; z: number };
export type Quat = { x: number; y: number; z: number; w: number };

export type InputPayload = {
  tick: number;
  inputVector: Vec2;
  drift?: boolean;
  turbo?: boolean;
  item?: boolean;
};

export type StatePayload = {
  pid: number;
  tick: number;
  position: Vec3;
  quaternion: Quat;
  velocity?: Vec3;
};
