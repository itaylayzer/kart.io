import { Player } from "../player/Player";
import { Global } from "../store/Global";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export class TrackerController {
  public reset: () => void;
  public update: () => void;

  private lastIndex: number = 0;
  private round: number = 0;

  static sortedTrackers: [number, TrackerController][];
  static readonly ls = 700;
  static points: THREE.Vector3[];
  private static trackers: Map<number, TrackerController>;

  static {
    this.points = [];
    this.trackers = new Map();
  }

  constructor(player: Player, isLocal: boolean) {
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
      const pos = Array.from(TrackerController.points.entries())
        .filter(([index]) => {
          return generateRange(
            this.lastIndex,
            TrackerController.ls,
            0,
            5
          ).includes(index);
        })
        .reduce(([indexA, vecA], [indexB, vecB]) => {
          const distA = vecA.distanceTo(player.position);
          const distB = vecB.distanceTo(player.position);
          if (distA > distB) return [indexB, vecB];
          return [indexA, vecA];
        });

      if (pos[0] === 1 && this.lastIndex === 0) {
        this.round++;
      }
      this.lastIndex = pos[0];
      dummy.position.copy(pos[1]);
      dummy.lookAt(
        TrackerController.points[(pos[0] + 1) % TrackerController.points.length]
      );

      const playerForward = player.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
      const roadForward = new THREE.Vector3(0, 0, 1).applyQuaternion(
        dummy.quaternion
      );
      const similarity = roadForward.dot(playerForward);

      if (isLocal) {
        const lookWrongHTML = document.querySelector(
          "p#wrong"
        )! as HTMLParagraphElement;
        lookWrongHTML.style.visibility = similarity >= 0 ? "hidden" : "visible";
      }
    };
  }

  public static update(localPID: number) {
    const trackers = Array.from(this.trackers.entries());
    trackers.sort((b, a) => {
      let compare = a[1].round - b[1].round;
      if (compare === 0) compare = a[1].lastIndex - b[1].lastIndex;
      return compare;
    });
    this.sortedTrackers = [...trackers];
    const rightPlayer = trackers
      .map((t, i) => [i, ...t] as [number, number, TrackerController])
      .filter((t) => {
        return t[1] === localPID;
      })[0];

    const positionHTML = document
      .querySelector("div#position")
      ?.querySelectorAll("div")!;
    const posInMatch = rightPlayer[0] + 1;
    positionHTML.item(0).innerHTML = `<p>${rightPlayer[2].round} / 3</p>`;
    positionHTML.item(1).innerHTML = `<p>${posInMatch} rd</p>`;
  }
  public static getScoreboard(): [string, number, number][] {
    return this.sortedTrackers.map(
      ([playerID, tracker], index) =>
        [
          Player.clients.get(playerID)!.name,
          index + 1,
          Math.max(tracker.round, 0),
        ] as [string, number, number]
    );
  }
}
function generateRange(
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
