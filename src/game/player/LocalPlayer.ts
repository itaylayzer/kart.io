import { Player } from "./Player";
import { getNameFromURL } from "../api/getNameFromURL";
import { KeyboardController } from "../controller/KeyboardController";
import { createVectorsFromNumbers } from "../api/setup/road";
import { curvePoints } from "../constants/road";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Global } from "../store/Global";
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

export class LocalPlayer extends Player {
  private static instance: LocalPlayer;
  public resetTracking: () => void;

  static getInstance() {
    return this.instance;
  }
  constructor(id: number, name: string) {
    super(id, true, name, new KeyboardController());
    const ls = 700;

    let lastIndex = ls - 5;
    let round = -1;
    LocalPlayer.instance = this;

    const points = Global.curve.getPoints(ls);
    points.pop();
    console.log("points.length", points.length);

    const dummy = new THREE.Object3D();
    this.resetTracking = () => {
      lastIndex = ls - 5;
      round = -1;
    };
    this.update.push(() => {
      const pos = Array.from(points.entries())
        .filter(([index]) => {
          return generateRange(lastIndex, ls, 0, 5).includes(index);
        })
        .reduce(([indexA, vecA], [indexB, vecB]) => {
          const distA = vecA.distanceTo(this.position);
          const distB = vecB.distanceTo(this.position);
          if (distA > distB) return [indexB, vecB];
          return [indexA, vecA];
        });

      if (pos[0] === 1 && lastIndex === 0) {
        round++;
      }
      lastIndex = pos[0];
      dummy.position.copy(pos[1]);
      dummy.lookAt(points[(pos[0] + 1) % points.length]);

      const playerForward = this.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
      const roadForward = new THREE.Vector3(0, 0, 1).applyQuaternion(
        dummy.quaternion
      );
      const similarity = roadForward.dot(playerForward);
      document.querySelector(
        "p#position"
      )!.innerHTML = `${round} / 3 [${lastIndex}]`;

      const lookWrongHTML = document.querySelector(
        "p#wrong"
      )! as HTMLParagraphElement;
      lookWrongHTML.style.visibility = similarity >= 0 ? "hidden" : "visible";
    });
  }
}
