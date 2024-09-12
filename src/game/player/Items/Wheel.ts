import { PhysicsObject } from "../../physics/PhysicsMesh";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Global } from "../../store/Global";
import { Player } from "../Player";
import {
    generateRange,
    TrackerController,
} from "../../controller/TrackerController";

const maxDistance = 1;

export class Wheels extends PhysicsObject {
    public static wheels: Map<number, Wheels>;
    static {
        this.wheels = new Map();
    }
    constructor(
        notFromId: number,
        position: CANNON.Vec3,
        quaternion: CANNON.Quaternion
    ) {
        position.y += 0.25;
        const group = new THREE.Group();
        const mesh = Global.assets.gltf.wheel.scene.clone();
        mesh.scale.multiplyScalar(0.08 * 4);
        group.add(mesh);
        super(group, {
            position,
            quaternion,
            shape: new CANNON.Cylinder(0.25, 0.25, 0.05),
            mass: 1,
            collisionFilterGroup: 3,
            collisionFilterMask: 1,
            isTrigger: true,
            material: new CANNON.Material({ friction: 0, restitution: 0 }),
        });

        const dispose = () => {
            Wheels.wheels.delete(this.id);
            Global.scene.remove(group);
            Global.world.removeBody(this);
        };

        const raycaster = new THREE.Raycaster();

        let lastIndex = TrackerController.points
            .map((v, i) => [i, v] as [number, THREE.Vector3])
            .reduce((a, b) => {
                if (a[1].distanceTo(position) < b[1].distanceTo(position))
                    return a;
                else return b;
            })[0];

        group.position.copy(this.position);
        group.quaternion.copy(this.quaternion);

        group.rotateZ(Math.PI / 2);
        // this.quaternion.copy(
        //     new CANNON.Quaternion(
        //         mesh.quaternion.x,
        //         mesh.quaternion.y,
        //         mesh.quaternion.z,
        //         mesh.quaternion.w
        //     )
        // );

        const timeout = setTimeout(() => {
            dispose();
        }, 10 * 1000);

        this.addEventListener("collide", (event: { body: CANNON.Body }) => {
            if (event.body.id === notFromId) return;
            if (event.body.collisionFilterGroup !== 1) return;
            clearTimeout(timeout);

            dispose();

            (event.body as Player).engine.shake();
        });
        const forwardVec = new CANNON.Vec3(0, 0, 1);
        this.quaternion.vmult(forwardVec, forwardVec);

        const updateTracker = () => {
            const forwardPos = Array.from(TrackerController.points.entries())
                .filter(([index]) => {
                    return generateRange(
                        lastIndex,
                        TrackerController.ls,
                        0,
                        5
                    ).includes(index);
                })
                .reduce(([indexA, vecA], [indexB, vecB]) => {
                    const distA = vecA.distanceTo(this.position);
                    const distB = vecB.distanceTo(this.position);
                    if (distA > distB) return [indexB, vecB];
                    return [indexA, vecA];
                });

            lastIndex = forwardPos[0];
        };

        const getPointTransform = () => {
            const dummy = new THREE.Object3D();
            dummy.position.copy(TrackerController.points[lastIndex]);
            dummy.lookAt(
                TrackerController.points[(lastIndex + 1) % TrackerController.ls]
            );

            return dummy;
        };

        const putToGround = () => {
            raycaster;

            raycaster.set(
                new THREE.Vector3()
                    .copy(this.position)
                    .add(new THREE.Vector3(0, 0.2, 0)),
                new THREE.Vector3(0, -1, 0).applyQuaternion(this.quaternion)
            );
            const intercetions = raycaster.intersectObjects(Global.roadMesh);

            const closestIntersection =
                intercetions.length === 0
                    ? undefined
                    : intercetions.length === 1
                    ? intercetions[0]
                    : intercetions.reduce((a, b) =>
                          a.distance > b.distance ? b : a
                      );

            if (
                closestIntersection === undefined ||
                closestIntersection.distance > maxDistance
            ) {
                // this.body.position.copy(this.last);

                const releventTransfer = getPointTransform() as THREE.Object3D;

                const A = new THREE.Vector3()
                    .copy(this.position)
                    .sub(releventTransfer.position);
                const B = new THREE.Vector3(1, 0, 0).applyQuaternion(
                    releventTransfer.quaternion
                );

                let impulse = B.clone();

                if (A.dot(B) > 0) {
                    impulse.negate();
                }

                impulse.multiplyScalar(5);
                const cannonImpulse = new CANNON.Vec3(
                    impulse.x,
                    impulse.y,
                    impulse.z
                );
                this.applyImpulse(cannonImpulse);

                cannonImpulse.normalize();
                const nextTargeting =
                    TrackerController.points[
                        (lastIndex + 10) % TrackerController.ls
                    ];
                const cannonNext = new CANNON.Vec3(
                    nextTargeting.x,
                    nextTargeting.y,
                    nextTargeting.z
                );
                cannonNext.vsub(this.position, cannonNext);
                cannonNext.normalize();
                cannonImpulse.vadd(cannonNext, cannonImpulse);
                forwardVec.vadd(cannonImpulse, forwardVec);
                forwardVec.scale(0.5, forwardVec);
                return;
            }

            // const up = closestIntersection.normal;

            const groundPoint = closestIntersection.point!;
            const groundNormal = closestIntersection.normal;

            // Adjust the kart's position to the ground
            this.position.y = groundPoint.y;

            if (groundNormal === undefined) return;

            // Convert the current up vector and ground normal to CANNON.Vec3
            const currentUp = this.quaternion.vmult(new CANNON.Vec3(0, 1, 0));
            const groundNormalCannon = new CANNON.Vec3(
                groundNormal.x,
                groundNormal.y,
                groundNormal.z
            );

            // Calculate the quaternion needed to align the up vector with the ground normal
            const alignUpQuat = new CANNON.Quaternion();
            alignUpQuat.setFromVectors(currentUp, groundNormalCannon);

            // Apply the alignment quaternion to the current quaternion
            this.quaternion = alignUpQuat.mult(this.quaternion);
        };

        this.update = [
            () => {
                updateTracker();

                const drivingForce = forwardVec.scale(15);

                const velocity = this.velocity.clone();
                const frictionForce = velocity.scale(-2);

                const totalForce = drivingForce.vadd(frictionForce);
                this.force.copy(totalForce);

                putToGround();
            },
            () => {
                group.visible =
                    group.position.distanceTo(Global.camera.position) < 50;

                group.position.copy(this.position);
                group.position.y += 0.1;
                mesh.rotateY(0.2);
                group.quaternion.copy(this.quaternion);
            },
        ];

        Global.scene.add(group);
        Global.world.addBody(this);

        Wheels.wheels.set(this.id, this);
    }
}
