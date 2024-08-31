import { createVectorsFromNumbers } from "../api/setup/road";
import { curvePoints } from "../constants/road";
import * as THREE from "three";
import { Player } from "./Player";
import { MysteryBox } from "../api/meshes/MysteryBox";
export class WorldMap {
  public update: () => void;

  constructor() {
    const curve = new THREE.CatmullRomCurve3(
      createVectorsFromNumbers(curvePoints)
    );
    const points = curve.getPoints(500);

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

    const flagPosition = curve.getPoints(700)[1];

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

    const renderRoad = () => {
      for (let index = 1; index < points.length; index++) {
        const pfrom = calcPoint(points[index - 1]);
        const pto = calcPoint(points[index]);

        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "black";
        ctx.globalAlpha = 1;
        ctx.lineWidth = 40 + pto[2] * 5;

        ctx.beginPath();
        ctx.moveTo(pfrom[0], pfrom[1]);
        ctx.lineTo(pto[0], pto[1]);
        ctx.stroke();

        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "white";
        ctx.globalAlpha = pto[2] * 0.5 + 0.5;
        ctx.lineWidth = 25 + pto[2] * 5;

        ctx.beginPath();
        ctx.moveTo(pfrom[0], pfrom[1]);
        ctx.lineTo(pto[0], pto[1]);
        ctx.stroke();
      }

      const flagRelative = calcPoint(flagPosition);

      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 10;
      const flagSize = 6;
      for (let x = 0; x < 3; x++) {
        const w = 4;
        for (let y = 0; y <= w; y++) {
          ctx.beginPath();

          ctx.fillRect(
            flagRelative[0] - flagSize / 2 + x * flagSize,
            flagRelative[1] - flagSize / 2 + (y - w / 2) * flagSize,
            flagSize,
            flagSize
          );
          ctx.strokeRect(
            flagRelative[0] - flagSize / 2 + x * flagSize,
            flagRelative[1] - flagSize / 2 + (y - w / 2) * flagSize,
            flagSize,
            flagSize
          );
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";

      for (let x = 0; x < 3; x++) {
        const w = 4;
        for (let y = 0; y <= w; y++) {
          ctx.fillStyle = ["#ffffff", "#000000"][(x + y) % 2];
          ctx.beginPath();

          ctx.fillRect(
            flagRelative[0] - flagSize / 2 + x * flagSize,
            flagRelative[1] - flagSize / 2 + (y - w / 2) * flagSize,
            flagSize,
            flagSize
          );
          ctx.stroke();
        }
      }
    };

    const dummyVec = new THREE.Vector3();
    const renderPlayers = () => {
      function render(colors = true, basicLength = 0) {
        for (const player of Player.clients.values()) {
          const p = calcPoint(dummyVec.copy(player.position));

          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.lineWidth = 25 + basicLength + p[2] * 5;
          if (colors) ctx.strokeStyle = player.color;
          ctx.arc(p[0], p[1], 0.5, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "black";
      render(false, 10);
      ctx.globalCompositeOperation = "source-over";
      render(true);
    };

    const renderMysteryBoxes = () => {
      const render = (
        startSize: number,
        color: string,
        destinationOut: boolean = false
      ) => {
        ctx.globalCompositeOperation = (
          ["source-over", "destination-out"] as GlobalCompositeOperation[]
        )[+destinationOut];

        for (const box of MysteryBox.boxes.values()) {
          if (!box.mesh.visible) continue;
          const p = calcPoint(box.mesh.getWorldPosition(dummyVec));

          ctx.lineWidth = startSize + p[2] * 5;
          ctx.globalAlpha = p[2] * 0.5 + 0.5;

          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.arc(p[0], p[1], 0.5, 0, 2 * Math.PI);
          ctx.stroke();
        }
      };

      render(15, "black", true);
      render(10, "#de7310");
    };

    this.update = () => {
      ctx.clearRect(0, 0, size, size);
      renderRoad();
      renderMysteryBoxes();
      renderPlayers();
    };
  }
}
