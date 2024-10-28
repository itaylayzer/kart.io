import { Player } from "../player/Player";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GameTracker } from "./GameTracker";

export interface UpdateObject {
    update: () => void;
}

export interface GameState {
    players: Map<number, Player>;
    scene: THREE.Scene;
    world: CANNON.World;
    deltaTime: number;
    elapsedTime: number;
    roadsSegments: THREE.Mesh[]
    startTimerLocked: boolean
    curve: THREE.CatmullRomCurve3;
    tracker: GameTracker;
}