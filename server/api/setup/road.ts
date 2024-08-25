import * as THREE from "three";
import * as CANNON from "cannon-es";
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

export function buildRoadFromBezier(
  dots: THREE.Vector3[],
  size: number
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(dots);
  curve.closed = true;
  const shape = new THREE.Shape();
  const halfWidth = size / 2;
  const thickness = 0.1;

  shape.moveTo(-halfWidth, thickness / 2);
  shape.lineTo(halfWidth, thickness / 2);
  shape.lineTo(halfWidth, -thickness / 2);
  shape.lineTo(-halfWidth, -thickness / 2);
  shape.lineTo(-halfWidth, thickness / 2);

  // Extrude along the curve
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 200, // Number of divisions along the curve
    extrudePath: curve, // The curve to extrude along
    bevelEnabled: false, // Disable bevel to avoid artifacts
    bevelSize: 0.1,
    bevelThickness: 0.1,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({
    color: 0x444444,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

export function buildCannonShapeFromMesh(
  mesh: THREE.Mesh
): CANNON.ConvexPolyhedron {
  const geometry = mesh.geometry as THREE.BufferGeometry;

  // Extract vertices from the geometry
  const vertices = geometry.attributes.position.array;
  const cannonVertices: CANNON.Vec3[] = [];

  for (let i = 0; i < vertices.length; i += 3) {
    cannonVertices.push(
      new CANNON.Vec3(vertices[i], vertices[i + 1], vertices[i + 2])
    );
  }

  // Extract faces from the geometry
  const indices = geometry.index ? geometry.index.array : undefined;
  const cannonFaces: number[][] = [];

  if (indices) {
    for (let i = 0; i < indices.length; i += 3) {
      cannonFaces.push([indices[i], indices[i + 1], indices[i + 2]]);
    }
  } else {
    // If geometry is not indexed, we create faces directly based on the vertex order
    for (let i = 0; i < cannonVertices.length; i += 3) {
      cannonFaces.push([i, i + 1, i + 2]);
    }
  }

  // Calculate normals as CANNON.Vec3 objects
  const normals: CANNON.Vec3[] = [];
  for (const face of cannonFaces) {
    const v0 = cannonVertices[face[0]];
    const v1 = cannonVertices[face[1]];
    const v2 = cannonVertices[face[2]];

    // Compute the normal for each face
    const edge1 = v1.vsub(v0);
    const edge2 = v2.vsub(v0);
    const normal = edge1.cross(edge2);
    normal.normalize(); // Normalize in place

    // Add the normal as a CANNON.Vec3 object
    normals.push(normal);
  }

  // Create the Cannon.js ConvexPolyhedron
  const cannonShape = new CANNON.ConvexPolyhedron({
    vertices: cannonVertices,
    faces: cannonFaces,
    normals: normals, // Include normals as CANNON.Vec3 objects
  });

  return cannonShape;
}

export function buildRoad(
  dots: THREE.Vector3[],
  size: number,
  length: number
): [THREE.InstancedMesh, THREE.Mesh, CANNON.ConvexPolyhedron] {
  const pointsMesh = buildPoints(dots, size);
  const mesh = buildRoadFromBezier(dots, length);

  const shape = buildCannonShapeFromMesh(mesh);

  return [pointsMesh, mesh, shape];
}
