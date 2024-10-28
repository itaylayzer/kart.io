import { Player } from "../player/Player";
import { PlayerTracker } from "../player/PlayerTracker";
import * as THREE from 'three';
export class GameTracker {

    public sortedTrackers: [number, PlayerTracker][];
    public readonly ls = 700;
    public points: THREE.Vector3[];
    public trackers: Map<number, PlayerTracker>;
    public FINALS: number[];

    constructor() {
        this.points = [];
        this.trackers = new Map();
        this.FINALS = [];
    }
    public update() {
        const trackers = Array.from(this.trackers.entries()).filter(
            ([id, _]) => !(this.FINALS ?? []).includes(id)
        );
        trackers.sort((b, a) => {
            let compare = a[1].round - b[1].round;
            if (compare === 0) compare = a[1].lastIndex - b[1].lastIndex;
            return compare;
        });
        this.sortedTrackers = [
            ...(this.FINALS ?? []).map(
                (v) => [v, this.trackers.get(v)!] as [number, PlayerTracker]
            ),
            ...trackers,
        ];

    }

}