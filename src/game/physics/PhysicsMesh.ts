import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Action } from "@/src/hooks/useDestroy";
export class PhysicsObject<T extends THREE.Object3D = THREE.Object3D> extends CANNON.Body {
    public static childrens: PhysicsObject[];

    static {
        this.childrens = [];
    }

    protected offsets = {
        position: new CANNON.Vec3(),
        quaternion: new CANNON.Vec3(),
    };

    public update: Action[];
    constructor(
        public object3d: T,
        options?: {
            collisionFilterGroup?: number;
            collisionFilterMask?: number;
            collisionResponse?: boolean;
            position?: CANNON.Vec3;
            velocity?: CANNON.Vec3;
            mass?: number;
            material?: CANNON.Material;
            linearDamping?: number;
            type?: CANNON.BodyType;
            allowSleep?: boolean;
            sleepSpeedLimit?: number;
            sleepTimeLimit?: number;
            quaternion?: CANNON.Quaternion;
            angularVelocity?: CANNON.Vec3;
            fixedRotation?: boolean;
            angularDamping?: number;
            linearFactor?: CANNON.Vec3;
            angularFactor?: CANNON.Vec3;
            shape?: CANNON.Shape;
            isTrigger?: boolean;
        }
    ) {
        super(options);
        this.sleepSpeedLimit = 0;

        PhysicsObject.childrens.push(this);
        this.update = [
            () => {
                object3d.position.copy(this.position.clone().vadd(this.offsets.position));
                object3d.quaternion.copy(this.quaternion);
            },
        ];
    }
}
