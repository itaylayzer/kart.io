import { curvePoints } from "@shared/config/road";
import { CatmullRomCurve3, Vector3 } from "three";
import { createStartLocationsGenerator } from "./starters";
import { calculatesMysteries } from "./mysteries";
import { MysteryBoxSchema } from "@/rooms/schema/KartRaceState";
import { ArraySchema } from "@colyseus/schema";


export const roadUtils = (mapId: number) => {
    const pts: Vector3[] = [];

    for (let i = 0; i < curvePoints[mapId].length; i += 3) {
        pts.push(
            new Vector3(
                curvePoints[mapId][i],
                curvePoints[mapId][i + 1],
                curvePoints[mapId][i + 2]
            )
        );
    }

    const curve = new CatmullRomCurve3(pts);

    return {
        mysteries(array: ArraySchema<MysteryBoxSchema>) {
            calculatesMysteries(array, curve, 700);
        },
    }

    const startsLocationsGenerator = createStartLocationsGenerator(
        curve.getPoints(1000),
        1000,
        990
    );
    // return { mysteryLocations, startsLocationsGenerator };
}