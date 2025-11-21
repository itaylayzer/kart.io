import * as THREE from "three";

/**
 * @author https://hofk.de/main/discourse.threejs/2021/CarRacing/CarRacing.html
 */
export function createRoad(
    curve: THREE.CatmullRomCurve3,
    roadLength: number,
    segmentCount: number = 10, // Number of segments
    ls: number = 1400
): THREE.Mesh[] {
    const ws = 5; // width segments
    const wss = ws + 1;

    const points = curve.getPoints(ls);
    const len = curve.getLength();
    const lenList = curve.getLengths(ls);

    // Split logic
    const segmentLength = Math.floor(ls / segmentCount);
    const segmentMeshes: THREE.Mesh[] = [];

    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
        const startIdx = segmentIndex * segmentLength;
        const endIdx = (segmentIndex + 1) * segmentLength;

        const segmentGeometry = new THREE.BufferGeometry();

        const indices = new Uint32Array(segmentLength * ws * 6); // Each segment has its own index array
        const vertices = new Float32Array((segmentLength + 1) * wss * 3);
        const uvs = new Float32Array((segmentLength + 1) * wss * 2);

        segmentGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
        segmentGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(vertices, 3)
        );
        segmentGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

        let idxCount = 0;
        let posIdx = 0;
        let uvIdxCount = 0;

        for (let j = startIdx; j < endIdx; j++) {
            for (let i = 0; i < ws; i++) {
                const a = wss * (j - startIdx) + i;
                const b1 = wss * (j - startIdx + 1) + i;
                const c1 = wss * (j - startIdx + 1) + 1 + i;
                const c2 = wss * (j - startIdx) + 1 + i;

                indices[idxCount] = a;
                indices[idxCount + 1] = b1;
                indices[idxCount + 2] = c1;

                indices[idxCount + 3] = a;
                indices[idxCount + 4] = c1;
                indices[idxCount + 5] = c2;

                segmentGeometry.addGroup(idxCount, 6, i);
                idxCount += 6;
            }

            for (let i = 0; i < wss; i++) {
                uvs[uvIdxCount] = lenList[j] / len;
                uvs[uvIdxCount + 1] = i / ws;
                uvIdxCount += 2;
            }
        }

        const dw = [-1, -0.95, -0.025, 0.025, 0.95, 1];

        for (let j = startIdx; j <= endIdx; j++) {
            const tangent = curve.getTangent(j / ls);
            const normal = new THREE.Vector3();
            const binormal = new THREE.Vector3(0, 1, 0);

            normal.crossVectors(tangent, binormal);
            normal.y = 0;
            normal.normalize();

            binormal.crossVectors(normal, tangent);

            for (let i = 0; i < wss; i++) {
                const x = points[j].x + dw[i] * roadLength * normal.x;
                const y = points[j].y;
                const z = points[j].z + dw[i] * roadLength * normal.z;

                vertices[posIdx] = x;
                vertices[posIdx + 1] = y;
                vertices[posIdx + 2] = z;
                posIdx += 3;
            }
        }

        // Calculate the centroid of the segment
        const centroid = new THREE.Vector3();
        for (let i = 0; i < vertices.length; i += 3) {
            centroid.x += vertices[i];
            centroid.y += vertices[i + 1];
            centroid.z += vertices[i + 2];
        }
        centroid.divideScalar(vertices.length / 3);

        // Translate vertices so the centroid is at the origin
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] -= centroid.x;
            vertices[i + 1] -= centroid.y;
            vertices[i + 2] -= centroid.z;
        }

        const material = [
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
            }),
            new THREE.MeshBasicMaterial({
                color: 0x111111,
                side: THREE.DoubleSide,
            }),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
            }),
            new THREE.MeshBasicMaterial({
                color: 0x111111,
                side: THREE.DoubleSide,
            }),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
            }),
        ];

        segmentGeometry.computeBoundingBox();
        segmentGeometry.computeVertexNormals();

        const segmentMesh = new THREE.Mesh(segmentGeometry, material);

        // Set the position of the segment mesh to the centroid
        segmentMesh.position.copy(centroid);
        segmentMesh.frustumCulled = true;
        segmentMeshes.push(segmentMesh);
    }

    return segmentMeshes;
}
