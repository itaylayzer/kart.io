import { curvePoints } from "../../src/game/constants/road";
import * as THREE from "three";
import { createMysteryBoxes } from "./createMysteryBoxes";
import { randInt } from "three/src/math/MathUtils.js";
import { createStartLocationsGenerator } from "./createStartLocationsGenerator";

export default function () {
  const pts: THREE.Vector3[] = [];

  for (let i = 0; i < curvePoints.length; i += 3) {
    pts.push(
      new THREE.Vector3(curvePoints[i], curvePoints[i + 1], curvePoints[i + 2])
    );
  }

  const curve = new THREE.CatmullRomCurve3(pts);

  const mysteryLocations = createMysteryBoxes(curve, 700);

  const startsLocationsGenerator = createStartLocationsGenerator(
    curve.getPoints(1000),
    1000,
    0
  );
  return { mysteryLocations, startsLocationsGenerator };
}
