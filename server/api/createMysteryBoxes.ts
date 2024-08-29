import * as THREE from "three";
import { curvePoints } from "../../src/game/constants/road";

export function createMysteryBoxes() {
  const pts: THREE.Vector3[] = [];

  for (let i = 0; i < curvePoints.length; i += 3) {
    pts.push(
      new THREE.Vector3(curvePoints[i], curvePoints[i + 1], curvePoints[i + 2])
    );
  }

  const ls = 700;

  const points = new THREE.CatmullRomCurve3(pts).getPoints(ls);

  const dummyHorizontal = new THREE.Object3D();
  const dummyVertical = new THREE.Object3D();

  let mysteryBoxLocations: number[] = [];

  const devideVertical = 10;
  const devideHorizontal = 5;
  for (let x = 1; x < devideVertical + 1; x++) {
    const sourceIndex = Math.floor((x * ls) / (devideVertical + 1));
    const destIndex = sourceIndex + 1;

    dummyVertical.position.copy(points[sourceIndex]);
    dummyVertical.lookAt(points[destIndex]);

    for (let y = 0; y < devideHorizontal; y++) {
      dummyHorizontal.position.copy(dummyVertical.position);
      dummyHorizontal.position
        .add(
          new THREE.Vector3(
            (y - (devideHorizontal - 1) / 2) * 1.5,
            0,
            0
          ).applyQuaternion(dummyVertical.quaternion)
        )
        .add(
          new THREE.Vector3(0, 0.4, 0).applyQuaternion(dummyVertical.quaternion)
        );

      mysteryBoxLocations.push(
        dummyHorizontal.position.x,
        dummyHorizontal.position.y,
        dummyHorizontal.position.z
      );
    }
  }

  return mysteryBoxLocations;
}
