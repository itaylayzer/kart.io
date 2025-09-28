import * as THREE from "three";
import { SimplifyModifier } from "three/examples/jsm/modifiers/SimplifyModifier.js";
import { Global } from "../store/Global";

/**
 * Create LOD from a source mesh by auto-generating simplified levels.
 *
 * @param srcMesh            High-detail mesh (geometry must be BufferGeometry)
 * @param distances          Distances for each level (world units). Example: [0, 40, 80]
 * @param keepFractions      Fractions of triangles to keep per level. Example: [1.0, 0.4, 0.1]
 *                           Must be same length as distances.
 */
export function makeAutoLOD(
    srcMesh: THREE.Mesh,
    parent: THREE.Object3D = Global.scene,
    distances: number[] = [0, 40, 80],
    keepFractions: number[] = [1.0, 0.4, 0.1],
) {
    if (distances.length !== keepFractions.length) {
        throw new Error("distances and keepFractions must be same length");
    }

    const lod = new THREE.LOD();
    lod.position.copy(srcMesh.position);
    lod.quaternion.copy(srcMesh.quaternion);
    lod.scale.copy(srcMesh.scale);

    const srcGeom = srcMesh.geometry as THREE.BufferGeometry;
    if (!srcGeom.index) srcGeom.setIndex([...Array(srcGeom.getAttribute("position").count).keys()]); // ensure indexed

    const triCount = srcGeom.index ? (srcGeom.index.count / 3) : (srcGeom.getAttribute("position").count / 3);
    const modifier = new SimplifyModifier();

    for (let i = 0; i < distances.length; i++) {
        const keep = THREE.MathUtils.clamp(keepFractions[i], 0.01, 1);
        let geom: THREE.BufferGeometry;

        if (i === 0 && keep === 1) {
            // level 0: use original geometry as-is
            geom = srcGeom.clone();
        } else {
            // simplify by target triangle count
            const target = Math.max(3, Math.floor(triCount * keep));
            geom = modifier.modify(srcGeom.clone(), target);
        }

        geom.computeVertexNormals();
        geom.computeBoundingSphere();

        // clone material (or reuse) as needed
        const mat = Array.isArray(srcMesh.material)
            ? srcMesh.material.map(m => m.clone())
            : srcMesh.material.clone();

        const levelMesh = new THREE.Mesh(geom, mat);
        levelMesh.castShadow = srcMesh.castShadow;
        levelMesh.receiveShadow = srcMesh.receiveShadow;

        lod.addLevel(levelMesh, distances[i]);
    }

    parent.add(lod);
    //   return lod;
}
