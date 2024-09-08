import * as THREE from "three";

export function buildPoints(
  points: THREE.Vector3[],
  size: number
): THREE.InstancedMesh {
  // Create box geometry with the specified size
  const boxGeometry = new THREE.BoxGeometry(size, size, size);
  const boxMaterial = new THREE.MeshBasicMaterial({
    color: "red",
    opacity: 0.5,
  });

  // Create an InstancedMesh
  const instancedMesh = new THREE.InstancedMesh(
    boxGeometry,
    boxMaterial,
    points.length
  );

  const dummy = new THREE.Object3D(); // Helper object to apply transformations

  points.forEach((point, index) => {
    dummy.position.copy(point);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(index, dummy.matrix);
  });

  instancedMesh.instanceMatrix.needsUpdate = true;

  return instancedMesh;
}

export function createVectorsFromNumbers(curvePoints: number[]) {
  let pts: THREE.Vector3[] = [];
  for (let i = 0; i < curvePoints.length; i += 3) {
    pts.push(
      new THREE.Vector3(curvePoints[i], curvePoints[i + 1], curvePoints[i + 2])
    );
  }
  return pts;
}

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

    const material = [
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
    ];

    segmentGeometry.computeBoundingBox();
    segmentGeometry.computeVertexNormals();

    const segmentMesh = new THREE.Mesh(segmentGeometry, material);
    segmentMeshes.push(segmentMesh);
  }

  return segmentMeshes;
}

export function createFences(
  curve: THREE.CatmullRomCurve3,
  roadWidth: number,
  segmentCount: number = 10, // Number of segments
  ls: number = 1400
): THREE.Mesh[] {
  const points = curve.getPoints(ls);
  const segmentLength = Math.floor(ls / segmentCount);
  const fenceMeshes: THREE.Mesh[] = [];

  const dw = [1, -1]; // Directions for both sides of the road

  for (let side = 0; side < 2; side++) {
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const startIdx = segmentIndex * segmentLength;
      const endIdx = (segmentIndex + 1) * segmentLength;

      const segmentGeometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];

      const direction = dw[side];

      for (let j = startIdx; j < endIdx; j++) {
        const tangent = curve.getTangent(j / ls);
        const normal = new THREE.Vector3();
        const binormal = new THREE.Vector3(0, 1, 0);

        normal.crossVectors(tangent, binormal);
        normal.y = 0;
        normal.normalize();

        // Calculate the four vertices for the current fence segment
        const bottomLeft = new THREE.Vector3(
          points[j].x + direction * roadWidth * normal.x,
          points[j].y,
          points[j].z + direction * roadWidth * normal.z
        ).add(binormal.clone().multiplyScalar(0.1));

        const topLeft = new THREE.Vector3(
          points[j].x + direction * roadWidth * normal.x,
          points[j].y,
          points[j].z + direction * roadWidth * normal.z
        ).add(binormal.clone().multiplyScalar(0.3));

        const bottomRight = new THREE.Vector3(
          points[j + 1].x + direction * roadWidth * normal.x,
          points[j + 1].y,
          points[j + 1].z + direction * roadWidth * normal.z
        ).add(binormal.clone().multiplyScalar(0.1));

        const topRight = new THREE.Vector3(
          points[j + 1].x + direction * roadWidth * normal.x,
          points[j + 1].y,
          points[j + 1].z + direction * roadWidth * normal.z
        ).add(binormal.clone().multiplyScalar(0.3));

        // Push the vertices to the vertices array
        vertices.push(
          bottomLeft.x,
          bottomLeft.y,
          bottomLeft.z, // 0
          bottomRight.x,
          bottomRight.y,
          bottomRight.z, // 1
          topRight.x,
          topRight.y,
          topRight.z, // 2
          topLeft.x,
          topLeft.y,
          topLeft.z // 3
        );

        const baseIndex = (j - startIdx) * 4;

        // Create two triangles (two faces) using the vertices
        indices.push(
          baseIndex,
          baseIndex + 1,
          baseIndex + 2, // First triangle
          baseIndex,
          baseIndex + 2,
          baseIndex + 3 // Second triangle
        );
      }

      segmentGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );
      segmentGeometry.setIndex(indices);

      const material = new THREE.MeshBasicMaterial({
        color: 0x8b4513, // Brown color for the fence
        side: THREE.DoubleSide,
      });

      segmentGeometry.computeBoundingBox();
      segmentGeometry.computeVertexNormals();

      const segmentMesh = new THREE.Mesh(segmentGeometry, material);
      fenceMeshes.push(segmentMesh);
    }
  }

  return fenceMeshes;
}

export function createFencesPilars(
  curve: THREE.CatmullRomCurve3,
  roadWidth: number,
  segmentCount: number = 10, // Number of segments
  ls: number = 1400,
  roadMeshes: THREE.Mesh[]
): THREE.Mesh[] {
  const points = curve.getPoints(ls);
  const fenceMeshes: THREE.Mesh[] = [];

  const raycaster = new THREE.Raycaster();
  raycaster.far = 1000;
  raycaster.near = 0;

  const segmentLength = Math.floor(ls / segmentCount);
  const dw = [1, -1]; // Directions for both sides of the road

  for (let side = 0; side < 2; side++) {
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const direction = dw[side];
      const startIdx = segmentIndex * segmentLength;

      const tangent = curve.getTangent(startIdx / ls);
      const normal = new THREE.Vector3();
      const binormal = new THREE.Vector3(0, 1, 0);

      normal.crossVectors(tangent, binormal);
      normal.y = 0;
      normal.normalize();

      // Calculate the four vertices for the current fence segment
      const point = new THREE.Vector3(
        points[startIdx].x + direction * roadWidth * normal.x,
        points[startIdx].y,
        points[startIdx].z + direction * roadWidth * normal.z
      );

      raycaster.set(point, new THREE.Vector3(0, -1, 0));

      if (raycaster.intersectObjects(roadMeshes).length) {
        continue;
      }

      const extraHeight = 5;

      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.8 + extraHeight + point.y, 5, 5),
        new THREE.MeshPhongMaterial({ color: "white" })
      );
      mesh.frustumCulled = true;

      mesh.position.copy(point);
      mesh.position.y = -extraHeight / 2 + point.y / 2;

      fenceMeshes.push(mesh);
    }
  }

  return fenceMeshes;
}
