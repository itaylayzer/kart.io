import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PlayerEntity } from "@/entities/PlayerEntity";

export class TrackerController {
    static readonly ls = 700;

    public reset: () => void;
    public update: () => void;

    public getPointTransform: (position?: THREE.Vector3Like) => THREE.Object3D;
    private lastIndex: number = 0;
    public round: number;

    public shouldLock: () => boolean;

    constructor(player: PlayerEntity) {
        const MAX_ROUNDS = 3;
        this.round = -1;


        const dummy = new THREE.Object3D();
        this.reset = () => {
            this.lastIndex = TrackerController.ls - 5;
            this.round = -1;
        };

        this.update = () => {
            const forwardPos = Array.from(player.context.trackerPoints.entries())
                .filter(([index]) => {
                    return generateRange(
                        this.lastIndex,
                        TrackerController.ls,
                        -5,
                        5
                    ).includes(index);
                })
                .reduce(([indexA, vecA], [indexB, vecB]) => {
                    const distA = vecA.distanceTo(player.position);
                    const distB = vecB.distanceTo(player.position);
                    if (distA > distB) return [indexB, vecB];
                    return [indexA, vecA];
                });

            if (forwardPos[0] === 1 && this.lastIndex === 0) {
                this.round++;
            }
            if (forwardPos[0] === 0 && this.lastIndex === 1) {
                this.round--;
            }

            this.lastIndex = forwardPos[0];
        };
        this.getPointTransform = (position?) => {
            const dummy = new THREE.Object3D();
            dummy.position.copy(
                position ?? player.context.trackerPoints[this.lastIndex]
            );
            dummy.lookAt(
                player.context.trackerPoints[
                (this.lastIndex + 1) % TrackerController.ls
                ]
            );

            return dummy;
        };
        this.shouldLock = () => this.round >= MAX_ROUNDS;
    }
}
export function generateRange(
    current: number,
    limit: number,
    backSteps: number,
    forwardSteps: number
): number[] {
    const result: number[] = [];

    for (let i = backSteps; i <= forwardSteps; i++) {
        const pos = (current + i + limit) % limit;
        result.push(pos);
    }

    return result;
}
