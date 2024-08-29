import { createVectorsFromNumbers } from "../api/setup/road";
import { curvePoints } from "../constants/road";
import * as THREE from "three";
import { Player } from "./Player";
export class WorldMap {
  public update: () => void;

  constructor() {
    const points = new THREE.CatmullRomCurve3(
      createVectorsFromNumbers(curvePoints)
    ).getPoints(1400);

    const maxPoint = points.reduce(
      (prev, curr) =>
        new THREE.Vector3(
          Math.max(prev.x, curr.x),
          Math.max(prev.y, curr.y),
          Math.max(prev.z, curr.z)
        )
    );

    const minPoint = points.reduce(
      (prev, curr) =>
        new THREE.Vector3(
          Math.min(prev.x, curr.x),
          Math.min(prev.y, curr.y),
          Math.min(prev.z, curr.z)
        )
    );

    const canvasHTML = document.querySelector(
      "canvas#map"
    )! as HTMLCanvasElement;
    const ctx = canvasHTML.getContext("2d")!;
    const size = 500;

    const padding = (ctx.lineWidth = 30);

    const calcPoint = (point: THREE.Vector3) => {
      const calcRelative = (axis: "x" | "y" | "z") =>
        (point[axis] - minPoint[axis]) / (maxPoint[axis] - minPoint[axis]);

      const calcRelativeToSize = (axis: "x" | "y" | "z") =>
        calcRelative(axis) * (size - padding * 2);

      return [
        padding + calcRelativeToSize("x"),
        padding + calcRelativeToSize("z"),
        calcRelative("y"),
      ];
    };

    const renderRoad = (dontUseAlpha: boolean = false) => {
      for (let index = 1; index < points.length; index++) {
        ctx.beginPath();
        const pfrom = calcPoint(points[index - 1]);
        ctx.moveTo(pfrom[0], pfrom[1]);
        const pto = calcPoint(points[index]);
        ctx.globalAlpha = dontUseAlpha ? 1 : pto[2] * 0.5 + 0.5;
        ctx.lineTo(pto[0], pto[1]);
        ctx.stroke();
      }
    };

    const dummyVec = new THREE.Vector3();
    const renderPlayers = () => {
      for (const player of Player.clients.values()) {
        ctx.beginPath();
        const p = calcPoint(dummyVec.copy(player.position));
        ctx.globalAlpha = p[2] * 0.5 + 0.5;
        ctx.strokeStyle = "black";
        ctx.arc(p[0], p[1], 0.7, 0, 2 * Math.PI);
        ctx.strokeStyle = player.color;

        ctx.arc(p[0], p[1], 0.5, 0, 2 * Math.PI);
        ctx.stroke();
      }
    };

    this.update = () => {
      ctx.clearRect(0, 0, size, size);
      // ctx.strokeStyle = "black";
      // ctx.lineWidth = 35;

      // renderRoad(true);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 30;

      renderRoad();
      ctx.lineWidth = 20;
      renderPlayers();
    };
  }
}
