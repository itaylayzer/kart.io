import * as THREE from "three";
import { Player } from "./Player";
import { MysteryBox } from "../api/meshes/MysteryBox";
import { Global } from "../store/Global";
import * as CANNON from "cannon-es";
import { Wheels } from "./Items/Wheel";
export class WorldMap {
    public update: () => void;

    constructor() {
        const curve = Global.curve;
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
                (point[axis] - minPoint[axis]) /
                (maxPoint[axis] - minPoint[axis]);

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

                    ctx.lineWidth = 10 + basicLength + p[2] * 5;

                    ctx.globalAlpha = 1;
                    if (colors) ctx.strokeStyle = player.color;
                    if (Global.settings.useArrow) {
                        const size = 10 + basicLength;

                        // Define the triangle vertices
                        const vertices = [
                            { x: -size / 2, y: 0 },
                            { x: 0, y: size / 5 },
                            { x: size / 2, y: 0 },
                            { x: 0, y: size },
                        ];

                        // Function to draw a triangle
                        function drawTriangle(
                            vertices: Record<"x" | "y", number>[]
                        ) {
                            ctx.beginPath();
                            ctx.moveTo(vertices[0].x, vertices[0].y);
                            ctx.lineTo(vertices[1].x, vertices[1].y);
                            ctx.lineTo(vertices[2].x, vertices[2].y);
                            ctx.lineTo(vertices[3].x, vertices[3].y);
                            ctx.closePath();
                            ctx.stroke();
                        }

                        // Function to rotate a point around another point
                        function rotatePoint(
                            x: number,
                            y: number,
                            centerX: number,
                            centerY: number,
                            angle: number
                        ) {
                            const cos = Math.cos(angle);
                            const sin = Math.sin(angle);
                            const dx = x - centerX;
                            const dy = y - centerY;
                            return {
                                x: centerX + dx * cos - dy * sin,
                                y: centerY + dx * sin + dy * cos,
                            };
                        }

                        // Function to get rotated vertices
                        function getRotatedVertices(
                            vertices: Record<"x" | "y", number>[],
                            angle: number
                        ) {
                            // Calculate the center of the triangle
                            const centerX =
                                (vertices[0].x +
                                    vertices[1].x +
                                    vertices[2].x) /
                                3;
                            const centerY =
                                (vertices[0].y +
                                    vertices[1].y +
                                    vertices[2].y) /
                                3;

                            // Rotate each vertex
                            return vertices.map((vertex) =>
                                rotatePoint(
                                    vertex.x,
                                    vertex.y,
                                    centerX,
                                    centerY,
                                    angle
                                )
                            );
                        }
                        const rot = new CANNON.Vec3();
                        player.quaternion.toEuler(rot);
                        drawTriangle(
                            getRotatedVertices(vertices, -rot.y).map((v) => ({
                                x: v.x + p[0],
                                y: v.y + p[1],
                            }))
                        );
                    } else {
                        ctx.beginPath();

                        ctx.arc(p[0], p[1], 0.5, 0, 2 * Math.PI);
                        ctx.stroke();
                    }
                }

                for (const wheel of Wheels.wheels.values()) {
                    const p = calcPoint(dummyVec.copy(wheel.position));
                    ctx.globalAlpha = 1;
                    if (colors) ctx.strokeStyle = "black";
                    ctx.beginPath();
                    ctx.lineWidth = 10 + basicLength + p[2] * 5;

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
                    [
                        "source-over",
                        "destination-out",
                    ] as GlobalCompositeOperation[]
                )[+destinationOut];

                for (const box of MysteryBox.boxes.values()) {
                    if (!box.mysteryVisible) continue;
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

export function renderMap(
    curve: THREE.CatmullRomCurve3,
    canvas: HTMLCanvasElement,
    size: number
) {
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, size, size);
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

    const flagPosition = curve.getPoints(700)[1];

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
}
