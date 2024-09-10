import { curvePoints } from "../../src/game/constants/road";
import * as THREE from "three";
import { createMysteryBoxes } from "./createMysteryBoxes";
import { randInt } from "three/src/math/MathUtils.js";
import { createStartLocationsGenerator } from "./createStartLocationsGenerator";

export default function (mapInd: number) {
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i < curvePoints[mapInd].length; i += 3) {
        pts.push(
            new THREE.Vector3(
                curvePoints[mapInd][i],
                curvePoints[mapInd][i + 1],
                curvePoints[mapInd][i + 2]
            )
        );
    }

    const curve = new THREE.CatmullRomCurve3(pts);

    const mysteryLocations = createMysteryBoxes(curve, 700);

    const startsLocationsGenerator = createStartLocationsGenerator(
        curve.getPoints(1000),
        1000,
        990
    );
    return { mysteryLocations, startsLocationsGenerator };
}
