import { CatmullRomCurve3, Mesh, Scene, Vector3 } from "three";
import { World } from "cannon-es"

type Action = () => void;

export interface GameContext {
    scene: Scene;
    deltaTime: number;
    elapsedTime: number;
    updates: Action[];
    roadMesh: Mesh[];
    world: World;
    curve: CatmullRomCurve3;
    lateUpdates: Action[];
    playersBodies: Set<number>;
    trackerPoints: Vector3[]
}
