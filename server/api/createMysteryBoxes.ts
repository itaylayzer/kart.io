import * as THREE from "three";

export function createMysteryBoxes(curve: THREE.CatmullRomCurve3, ls: number) {
  const points = curve.getPoints(ls);

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
