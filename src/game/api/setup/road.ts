import * as THREE from "three";
import { Global } from "../../store/Global";

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
  curvePoints: number[],
  roadLength: number,
  size: number
): [THREE.InstancedMesh, THREE.Mesh] {
  const pts: THREE.Vector3[] = createVectorsFromNumbers(curvePoints);

  const ls = 1400; // length segments original was 1400
  const ws = 5; // width segments
  const lss = ls + 1;
  const wss = ws + 1;

  const curve = new THREE.CatmullRomCurve3(pts);
  Global.curve = curve;
  const points = curve.getPoints(ls);

  const len = curve.getLength();
  const lenList = curve.getLengths(ls);

  const faceCount = ls * ws * 2;
  const vertexCount = lss * wss;

  const indices = new Uint32Array(faceCount * 3);
  const vertices = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);

  const g = new THREE.BufferGeometry();
  g.setIndex(new THREE.BufferAttribute(indices, 1));
  g.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

  let idxCount = 0;
  let a, b1, c1, c2;

  for (let j = 0; j < ls; j++) {
    for (let i = 0; i < ws; i++) {
      // 2 faces / segment,  3 vertex indices
      a = wss * j + i;
      b1 = wss * (j + 1) + i; // right-bottom
      c1 = wss * (j + 1) + 1 + i;
      //  b2 = c1							// left-top
      c2 = wss * j + 1 + i;

      indices[idxCount] = a; // right-bottom
      indices[idxCount + 1] = b1;
      indices[idxCount + 2] = c1;

      indices[idxCount + 3] = a; // left-top
      indices[idxCount + 4] = c1; // = b2,
      indices[idxCount + 5] = c2;

      g.addGroup(idxCount, 6, i); // write group for multi material

      idxCount += 6;
    }
  }

  let uvIdxCount = 0;
  for (let j = 0; j < lss; j++) {
    for (let i = 0; i < wss; i++) {
      uvs[uvIdxCount] = lenList[j] / len;
      uvs[uvIdxCount + 1] = i / ws;

      uvIdxCount += 2;
    }
  }

  let x, y, z;
  let posIdx = 0; // position index

  let tangent;
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3(0, 1, 0);

  const t: THREE.Vector3[] = []; // tangents
  const n: THREE.Vector3[] = []; // normals
  const b: THREE.Vector3[] = []; // binormals

  for (let j = 0; j < lss; j++) {
    // to the points

    tangent = curve.getTangent(j / ls);
    t.push(tangent.clone());

    normal.crossVectors(tangent, binormal);

    normal.y = 0; // to prevent lateral slope of the road

    normal.normalize();
    n.push(normal.clone());

    binormal.crossVectors(normal, tangent); // new binormal
    b.push(binormal.clone());
  }

  const dw = [-0.36, -0.34, -0.01, 0.01, 0.34, 0.36]; // width from the center line

  for (let j = 0; j < lss; j++) {
    // length

    for (let i = 0; i < wss; i++) {
      // width

      x = points[j].x + dw[i] * roadLength * n[j].x;
      y = points[j].y;
      z = points[j].z + dw[i] * roadLength * n[j].z;

      vertices[posIdx] = x;
      vertices[posIdx + 1] = y;
      vertices[posIdx + 2] = z;

      posIdx += 3;
    }
  }

  const tex = Global.assets.textures.txt_road;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(ls * 2, 1);

  const material = [
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
  ];

  g.computeBoundingBox();
  g.computeVertexNormals();

  const roadMesh = new THREE.Mesh(g, material);

  const dotsMesh = buildPoints(pts, size);
  return [dotsMesh, roadMesh];
}
