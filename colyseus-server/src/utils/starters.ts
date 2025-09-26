import * as THREE from "three";

const pointsInHorizontal = [0, 1, -1, 2, -2];
export function createStartLocationsGenerator(
    pts: THREE.Vector3[],
    ls: number,
    rowIndex: number
) {
    let horizontalIndex = 0;

    return () => {
        if (horizontalIndex === pointsInHorizontal.length) {
            horizontalIndex = 0;
            rowIndex = rowIndex - 1;
            if (rowIndex < 0) {
                rowIndex += ls;
            }
        }
        const dummy = new THREE.Object3D();
        dummy.position.copy(pts[rowIndex]);
        dummy.lookAt(pts[rowIndex + 1]);

        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(dummy.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
            dummy.quaternion
        );

        dummy.position.add(up.multiplyScalar(0.4));
        dummy.position.add(
            right.multiplyScalar(1.5 * pointsInHorizontal[horizontalIndex])
        );
        horizontalIndex++;
        return [
            dummy.position.x,
            dummy.position.y,
            dummy.position.z,
            dummy.quaternion.x,
            dummy.quaternion.y,
            dummy.quaternion.z,
            dummy.quaternion.w,
        ];
    };
}
