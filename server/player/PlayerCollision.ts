import * as CANNON from 'cannon-es'
export class PlayerCollision extends CANNON.Body {
    constructor(pid: number) {
        const radius = 0.8 / 3;

        super({
            shape: new CANNON.Cylinder(radius, radius, radius),
            mass: 1,
            position: new CANNON.Vec3(pid * 10, pid * 10, pid * 10),
            material: new CANNON.Material({ friction: 0, restitution: 0 }),
            collisionFilterGroup: 1,
            collisionFilterMask: ~0,
        })
    }
}