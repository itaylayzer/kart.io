import * as THREE from "three";

export class Trail extends THREE.Mesh {
    private positions: THREE.Vector3[] = [];
    private trailGeometry: THREE.BufferGeometry;

    constructor(
        private target: THREE.Object3D,
        private trailLength: number,
        color: [THREE.ColorRepresentation, number],
        private width: number,
        private division: number,
        opacity: number
    ) {
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: color[0],
            transparent: true,
            side: THREE.DoubleSide,
            opacity,
            fog: false,
        });
        super(trailGeometry, trailMaterial);

        // Initialize geometry arrays
        const vertices = new Float32Array(
            this.trailLength * this.division * 6 * 3
        ); // 6 vertices per quad (two triangles), 3 components per vertex
        const uvs = new Float32Array(this.trailLength * this.division * 6 * 2); // 2 components per UV

        trailGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(vertices, 3)
        );
        trailGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

        this.trailGeometry = trailGeometry;
    }

    update() {
        this.visible = this.target.visible;

        this.target.traverseAncestors((parent) => {
            if (parent.visible === false) this.visible = false;
        });

        // Get the world position of the target
        const worldPosition = new THREE.Vector3();
        this.target.getWorldPosition(worldPosition);

        this.position.copy(worldPosition);

        // Add the current world position to the array
        this.positions.push(worldPosition.clone());

        // Ensure the array doesn't exceed the maximum trail length
        if (this.positions.length > this.trailLength) {
            this.positions.shift();
        }

        // Update the geometry with the current positions
        this.updateTrailGeometry();
    }

    private cubicBezier(t: number): number {
        // Cubic Bezier curve starting from 1 to 0
        // Control points can be adjusted for different shapes
        const p0 = 1; // Start width
        const p1 = 0.5; // Control point 1
        const p2 = 0.5; // Control point 2
        const p3 = 0; // End width

        return (
            (1 - t) ** 3 * p0 +
            3 * (1 - t) ** 2 * t * p1 +
            3 * (1 - t) * t ** 2 * p2 +
            t ** 3 * p3
        );
    }

    private updateTrailGeometry() {
        const positionsArray = this.trailGeometry.attributes.position
            .array as Float32Array;

        let vertIndex = 0;

        // Loop through the positions and create quads
        for (let i = 0; i < this.positions.length - 1; i++) {
            const start = this.positions[i].clone().sub(this.position);
            const end = this.positions[i + 1].clone().sub(this.position);

            // Compute the direction and the perpendicular vector for width
            const direction = new THREE.Vector3()
                .subVectors(end, start)
                .normalize();
            const perpendicular = new THREE.Vector3()
                .crossVectors(direction, new THREE.Vector3(0, 1, 0))
                .normalize();

            // Calculate widths using cubic Bezier function
            const tStart = i / (this.positions.length - 1);
            const tEnd = (i + 1) / (this.positions.length - 1);
            const widthStart = this.cubicBezier(1 - tStart) * this.width;
            const widthEnd = this.cubicBezier(1 - tEnd) * this.width;

            // Vertices for the quad
            const halfWidthStart = widthStart / 2;
            const halfWidthEnd = widthEnd / 2;

            const v0 = start
                .clone()
                .add(perpendicular.clone().multiplyScalar(halfWidthStart)); // Top left
            const v1 = start
                .clone()
                .sub(perpendicular.clone().multiplyScalar(halfWidthStart)); // Bottom left
            const v2 = end
                .clone()
                .add(perpendicular.clone().multiplyScalar(halfWidthEnd)); // Top right
            const v3 = end
                .clone()
                .sub(perpendicular.clone().multiplyScalar(halfWidthEnd)); // Bottom right

            // Create two triangles for each quad
            // Triangle 1: v0 -> v1 -> v2
            positionsArray[vertIndex++] = v0.x;
            positionsArray[vertIndex++] = v0.y;
            positionsArray[vertIndex++] = v0.z;
            positionsArray[vertIndex++] = v1.x;
            positionsArray[vertIndex++] = v1.y;
            positionsArray[vertIndex++] = v1.z;
            positionsArray[vertIndex++] = v2.x;
            positionsArray[vertIndex++] = v2.y;
            positionsArray[vertIndex++] = v2.z;

            // Triangle 2: v2 -> v1 -> v3
            positionsArray[vertIndex++] = v2.x;
            positionsArray[vertIndex++] = v2.y;
            positionsArray[vertIndex++] = v2.z;
            positionsArray[vertIndex++] = v1.x;
            positionsArray[vertIndex++] = v1.y;
            positionsArray[vertIndex++] = v1.z;
            positionsArray[vertIndex++] = v3.x;
            positionsArray[vertIndex++] = v3.y;
            positionsArray[vertIndex++] = v3.z;
        }

        // Mark the geometry as needing update
        this.trailGeometry.attributes.position.needsUpdate = true;
    }
}
