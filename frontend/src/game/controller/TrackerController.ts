import { Player } from "../player/Player";
import { Global } from "../store/Global";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CS } from "../store/codes";
import { toast } from "react-toastify";

export class TrackerController {
    public reset: () => void;
    public update: () => void;

    public getPointTransform: (position?: THREE.Vector3Like) => THREE.Object3D;
    private lastIndex: number = 0;
    public round: number;

    static sortedTrackers: [number, TrackerController][];
    static readonly ls = 700;
    static points: THREE.Vector3[];
    private static trackers: Map<number, TrackerController>;
    public static FINALS: number[];
    public shouldLock: () => boolean;

    static {
        this.points = [];
        this.trackers = new Map();
        this.FINALS = [];
    }

    constructor(player: Player, isLocal: boolean) {
        const MAX_ROUNDS = 3;
        this.round = -1;
        TrackerController.trackers.set(player.pid, this);

        if (TrackerController.points.length === 0) {
            const points = Global.curve.getPoints(TrackerController.ls);
            points.pop();
            TrackerController.points = points;
        }

        const dummy = new THREE.Object3D();
        this.reset = () => {
            this.lastIndex = TrackerController.ls - 5;
            this.round = -1;
        };

        this.update = () => {
            const forwardPos = Array.from(TrackerController.points.entries())
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
                if (isLocal && this.round >= MAX_ROUNDS) {
                    toast("You Can Switch Cameras Now", { type: "info" });
                    // Global.socket?.emit(CS.FINISH_LINE);
                }
            }
            if (forwardPos[0] === 0 && this.lastIndex === 1) {
                this.round--;
            }

            this.lastIndex = forwardPos[0];
            dummy.position.copy(forwardPos[1]);
            dummy.lookAt(
                TrackerController.points[
                    (forwardPos[0] + 1) % TrackerController.points.length
                ]
            );

            const playerForward = player.quaternion.vmult(
                new CANNON.Vec3(0, 0, 1)
            );
            const roadForward = new THREE.Vector3(0, 0, 1).applyQuaternion(
                dummy.quaternion
            );
            const similarity = roadForward.dot(playerForward);
            const lookingRightWay = similarity >= 0;

            if (isLocal) {
                const lookWrongHTML = document.querySelector(
                    "p#wrong"
                )! as HTMLParagraphElement;
                lookWrongHTML.style.visibility = lookingRightWay
                    ? "hidden"
                    : "visible";
            }
        };
        this.getPointTransform = (position?) => {
            const dummy = new THREE.Object3D();
            dummy.position.copy(
                position ?? TrackerController.points[this.lastIndex]
            );
            dummy.lookAt(
                TrackerController.points[
                (this.lastIndex + 1) % TrackerController.ls
                ]
            );

            return dummy;
        };
        this.shouldLock = () => this.round >= MAX_ROUNDS;
    }

    public static update(localPID: number) {
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
                (v) => [v, this.trackers.get(v)!] as [number, TrackerController]
            ),
            ...trackers,
        ];

        const rightPlayer = [...this.sortedTrackers]
            .map((t, i) => [i, ...t] as [number, number, TrackerController])
            .filter((t) => {
                return t[1] === localPID;
            })[0];

        const positionHTML = document
            .querySelector("div#position")
            ?.querySelectorAll("div")!;
        const posInMatch = rightPlayer === undefined ? 100 : rightPlayer[0] + 1;
        const roundInMatch =
            rightPlayer === undefined ? -1 : rightPlayer[2].round;
        positionHTML.item(0).innerHTML = `<p>${Math.max(
            roundInMatch,
            0
        )} / 3</p>`;
        positionHTML.item(1).innerHTML = `<p>${posInMatch} ${["st", "th", "rd", "th"][Math.min(posInMatch - 1, 3)]
            }</p>`;
    }
    public static getScoreboard(): [string, string, number, number][] {
        return this.sortedTrackers.map(
            ([playerID, tracker], index) =>
                [
                    Player.clients.get(playerID)!.color,
                    Player.clients.get(playerID)!.name,
                    index + 1,
                    Math.max(tracker.round, 0),
                ] as [string, string, number, number]
        );
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
