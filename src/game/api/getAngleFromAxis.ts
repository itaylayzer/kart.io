import { QuaternionLike, Vector3Like, Quaternion } from "three";

export function getAngleFromAxis(
  quaternion: QuaternionLike,
  axis: Vector3Like
) {
  const threeQuaternion = new Quaternion().copy(quaternion);
  // Project the quaternion's rotation onto this axis to find the angle
  const projectedQuaternion = new Quaternion();
  projectedQuaternion.setFromAxisAngle(axis, 0);

  // Calculate the angle of rotation around this axis
  return 2 * Math.acos(threeQuaternion.dot(projectedQuaternion));
}
