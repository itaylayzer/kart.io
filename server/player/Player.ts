import { Socket } from "socket.io";
import { lerp } from "three/src/math/MathUtils.js";
import { Global } from "../store/Global";
import { KeyboardController } from "../controller/KeyboardController";
import { PhysicsObject } from "../physics/PhysicsMesh";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { DriveController } from "../controller/EngineController";
import { PlayerModel } from "./PlayerModel";
export class Player extends PhysicsObject {
    public keyboard: KeyboardController;
    private driveController: DriveController;
    constructor(
        public pid: string,
        public socket: Socket,
        public name: string
    ) {
        const radius = 0.8 / 3;
        const group = new THREE.Group();

        super(group, {
            shape: new CANNON.Cylinder(radius, radius, radius),
            mass: 1,
            position: new CANNON.Vec3(0, 5, 0),
            material: new CANNON.Material({ friction: 0, restitution: 0 }),
            collisionFilterGroup: 1,
            collisionFilterMask: ~0,
        });
        this.fixedRotation = true;
        this.updateMassProperties(); // Update mass properties after changing fixedRotation
        this.angularFactor.set(0, 1, 0); // Allow rotation only around the y-axis

        this.offsets.position.y = -2;

        this.keyboard = new KeyboardController();

        this.position.set(29, 0, 40);
        group.position.set(29, 0, 40);

        this.driveController = new DriveController(5, this, this.keyboard);

        const model = new PlayerModel(this, this.keyboard, pid);

        const update = () => {
            this.keyboard.firstUpdate();

            this.driveController.update();
            model.update();

            this.keyboard.lastUpdate();
        };

        this.update.push(update);

        Global.world.addBody(this);
    }
}
