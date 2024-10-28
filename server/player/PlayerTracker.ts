import * as THREE from 'three';
import { Player } from './Player';
import { GameState } from '../game/GameState';
import * as CANNON from 'cannon-es';
export class PlayerTracker {
    public reset: () => void;
    public update: () => void;

    public getPointTransform: (position?: THREE.Vector3Like) => THREE.Object3D;
    public lastIndex: number = 0;
    public round: number;


    public shouldLock: () => boolean;



    constructor(player: Player, game: GameState) {
        const MAX_ROUNDS = 3;
        this.round = -1;
        game.tracker.trackers.set(player.info.pid, this);

        if (game.tracker.points.length === 0) {
            const points = game.curve.getPoints(game.tracker.ls);
            points.pop();
            game.tracker.points = points;
        }

        const dummy = new THREE.Object3D();
        this.reset = () => {
            this.lastIndex = game.tracker.ls - 5;
            this.round = -1;
        };

        this.update = () => {
            const forwardPos = Array.from(game.tracker.points.entries())
                .filter(([index]) => {
                    return generateRange(
                        this.lastIndex,
                        game.tracker.ls,
                        -5,
                        5
                    ).includes(index);
                })
                .reduce(([indexA, vecA], [indexB, vecB]) => {
                    const distA = vecA.distanceTo(player.collider.position);
                    const distB = vecB.distanceTo(player.collider.position);
                    if (distA > distB) return [indexB, vecB];
                    return [indexA, vecA];
                });

            if (forwardPos[0] === 1 && this.lastIndex === 0) {
                this.round++;
                if (this.round >= MAX_ROUNDS) {
                    //    TODO: update world the current player finished the line
                    // Global.socket?.emit(CS.FINISH_LINE);
                }
            }
            if (forwardPos[0] === 0 && this.lastIndex === 1) {
                this.round--;
            }

            this.lastIndex = forwardPos[0];
            dummy.position.copy(forwardPos[1]);
            dummy.lookAt(
                game.tracker.points[
                (forwardPos[0] + 1) % game.tracker.points.length
                ]
            );

            const playerForward = player.collider.quaternion.vmult(
                new CANNON.Vec3(0, 0, 1)
            );
            const roadForward = new THREE.Vector3(0, 0, 1).applyQuaternion(
                dummy.quaternion
            );
            const similarity = roadForward.dot(playerForward);
            const lookingRightWay = similarity >= 0;


        };
        this.getPointTransform = (position?) => {
            const dummy = new THREE.Object3D();
            dummy.position.copy(
                position ?? game.tracker.points[this.lastIndex]
            );
            dummy.lookAt(
                game.tracker.points[
                (this.lastIndex + 1) % game.tracker.ls
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
