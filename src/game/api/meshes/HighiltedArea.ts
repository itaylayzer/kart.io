import * as THREE from "three";
import { Global } from "../../store/Global";
export class HighlightedArea extends THREE.Group {
    readonly outlineSpeed = 0.05 / 4;
    private outlineMaterial: THREE.MeshBasicMaterial;
    public outlines: THREE.Mesh[];
    private outlineOpacityMax: number;
    private outlineHeightMax: number;

    constructor({
        width,
        height,
        outlineHeightMax = 1,
        baseColor,
        baseOpacity,
        outlinesColors,
        position,
        thickness,
        outlineOpacityMax,
        depth,
        outlineCounts,
    }: {
        width: number;
        height: number;
        outlineHeightMax: number;
        position: THREE.Vector3Like;
        thickness: number;
        baseColor: THREE.ColorRepresentation;
        outlinesColors: THREE.ColorRepresentation;
        baseOpacity: number;
        outlineOpacityMax: number;
        depth: number;
        outlineCounts: number;
    }) {
        super();
        this.outlineHeightMax = outlineHeightMax;
        this.outlineOpacityMax = outlineOpacityMax;
        this.outlineMaterial = new THREE.MeshBasicMaterial({
            color: outlinesColors,
            opacity: 0,
            transparent: true,
            side: THREE.DoubleSide,
        });
        this.outlines = [];
        const floorGeometry = new THREE.PlaneGeometry(width, height);
        const floorMaterial = new THREE.MeshBasicMaterial({
            color: baseColor,
            opacity: baseOpacity,
            transparent: true,
            side: THREE.DoubleSide,
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;

        this.add(floor);
        for (let i = 0; i < outlineCounts; i++) {
            this.outlines.push(
                this.createOutline(
                    width,
                    height,
                    thickness,
                    i / outlineCounts,
                    depth
                )
            );
        }
        Global.scene.add(this);
        this.position.copy(position);
        this.castShadow = true;
        this.receiveShadow = true;
        Global.updates.push(this.update.bind(this));
    }

    private createOutline(
        width: number,
        height: number,
        thickness: number,
        i: number,
        depth: number
    ) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const vertices = new Float32Array([
            // Bottom face (y=0)
            -halfWidth,
            0,
            halfHeight, // 0
            halfWidth,
            0,
            halfHeight, // 1
            halfWidth,
            0,
            -halfHeight, // 2
            -halfWidth,
            0,
            -halfHeight, // 3
            -halfWidth + thickness,
            0,
            halfHeight - thickness, // 4
            halfWidth - thickness,
            0,
            halfHeight - thickness, // 5
            halfWidth - thickness,
            0,
            -halfHeight + thickness, // 6
            -halfWidth + thickness,
            0,
            -halfHeight + thickness, // 7

            // Top face (y=depth)
            -halfWidth,
            depth,
            halfHeight, // 8
            halfWidth,
            depth,
            halfHeight, // 9
            halfWidth,
            depth,
            -halfHeight, // 10
            -halfWidth,
            depth,
            -halfHeight, // 11
            -halfWidth + thickness,
            depth,
            halfHeight - thickness, // 12
            halfWidth - thickness,
            depth,
            halfHeight - thickness, // 13
            halfWidth - thickness,
            depth,
            -halfHeight + thickness, // 14
            -halfWidth + thickness,
            depth,
            -halfHeight + thickness, // 15
        ]);

        const indices = [
            // Bottom face
            0,
            1,
            5,
            0,
            5,
            4,
            1,
            2,
            6,
            1,
            6,
            5,
            2,
            3,
            7,
            2,
            7,
            6,
            3,
            0,
            4,
            3,
            4,
            7,

            // Top face
            8,
            9,
            13,
            8,
            13,
            12,
            9,
            10,
            14,
            9,
            14,
            13,
            10,
            11,
            15,
            10,
            15,
            14,
            11,
            8,
            12,
            11,
            12,
            15,

            // Side faces
            0,
            1,
            9,
            0,
            9,
            8,
            1,
            2,
            10,
            1,
            10,
            9,
            2,
            3,
            11,
            2,
            11,
            10,
            3,
            0,
            8,
            3,
            8,
            11,

            // Inner side faces
            4,
            5,
            13,
            4,
            13,
            12,
            5,
            6,
            14,
            5,
            14,
            13,
            6,
            7,
            15,
            6,
            15,
            14,
            7,
            4,
            12,
            7,
            12,
            15,
        ];
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(vertices, 3)
        );
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const outline = new THREE.Mesh(geometry, this.outlineMaterial.clone());
        // outline.rotation.x = -Math.PI / 2;
        // (outline);

        outline.position.y += i * this.outlineHeightMax;
        outline.material.opacity += i;

        this.add(outline);
        return outline;
    }
    public update() {
        this.outlines.forEach(outline => {
            outline.position.y +=
                this.outlineSpeed *
                this.outlineHeightMax *
                60 *
                Global.deltaTime;
            // @ts-ignore
            outline.material.opacity =
                Math.sin(outline.position.y / this.outlineHeightMax * Math.PI) *
                this.outlineOpacityMax;
            if (outline.position.y > this.outlineHeightMax) {
                outline.position.y = 0;
                // @ts-ignore
                outline.material.opacity = 0;
            }
        });
    }
}
