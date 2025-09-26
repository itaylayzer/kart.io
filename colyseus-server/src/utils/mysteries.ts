import { MysteryBoxSchema, VectorSchema } from "@/rooms/schema/KartRaceState";
import * as THREE from "three";
import { ArraySchema } from "@colyseus/schema";

export function calculatesMysteries(
    array: ArraySchema<MysteryBoxSchema>,
    curve: THREE.CatmullRomCurve3,
    ls: number,
    devideVertical: number = 10
) {
    const points = curve.getPoints(ls);

    const dummyHorizontal = new THREE.Object3D();
    const dummyVertical = new THREE.Object3D();

    const devideHorizontal = 5;
    for (let x = 0; x < devideVertical + 1; x++) {
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
                    new THREE.Vector3(0, 0.35, 0).applyQuaternion(
                        dummyVertical.quaternion
                    )
                );

            const position = new VectorSchema().assign(dummyHorizontal.position)
            const mysteryBox = new MysteryBoxSchema().assign({ index: array.length, visible: true, position });

            array.push(mysteryBox)

        }
    }

}
