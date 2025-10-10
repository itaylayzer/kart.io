import * as THREE from "three";
import * as CANNON from "cannon-es";
type Action = () => void;
export class PhysicsObject<
    T extends THREE.Object3D = THREE.Object3D
> extends CANNON.Body {

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

        this.update = [

        ];
    }

    protected matchEngines() {
        this.object3d.position.copy(
            this.position.clone().vadd(this.offsets.position)
        );
        this.object3d.quaternion.copy(this.quaternion);
    }
}