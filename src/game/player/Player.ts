import * as THREE from "three";
import { Global } from "../store/Global";
import { IKeyboardController } from "../controller/IKeyboardController";
import { DriveController } from "../controller/DriveController";
import { PhysicsObject } from "../physics/PhysicsMesh";
import * as CANNON from "cannon-es";
import { PlayerModel } from "./PlayerModel";
import { TrackerController } from "../controller/TrackerController";
import { AudioController } from "../controller/AudioController";
import { ItemController } from "../controller/ItemController";

export const COLORS = [
    "#f56505",
    "#f5ed05",
    "#0591f5",
    "#b105f5",
    "#f50575",
    "#00ff00",
    "#124eb5",
    "#ff0000",
];

const COLORSEMISSIVE = [5, 5, 4, 5, 6, 3, 10, 4];
export class Player extends PhysicsObject {
    public static clients: Map<number, Player>;
    public tracker: TrackerController;
    public items: ItemController;

    public disconnect: () => void;
    static {
        this.clients = new Map();
    }
    public color: string;

    constructor(
        public pid: number,
        isLocal: boolean,
        public name: string,
        public colorFromServer: number,
        public keyboard: IKeyboardController
    ) {
        const radius = 0.8 / 3;

        const colorSetEmissive = COLORSEMISSIVE[colorFromServer];
        const color =
            "#" + new THREE.Color(COLORS[colorFromServer]).getHexString();

        super(new THREE.Object3D(), {
            shape: new CANNON.Cylinder(radius, radius, radius),
            mass: 1,
            position: new CANNON.Vec3(pid * 10, pid * 10, pid * 10),
            material: new CANNON.Material({ friction: 0, restitution: 0 }),
            collisionFilterGroup: 1,
            collisionFilterMask: ~0,
        });

        this.tracker = new TrackerController(this, isLocal);
        this.color = color;
        Player.clients.set(pid, this);

        const audio = new AudioController();
        const engine = new DriveController(
            5,
            this,
            this.keyboard,
            audio,
            isLocal
        );
        const model = new PlayerModel(
            this,
            keyboard,
            name,
            [color, colorSetEmissive],
            isLocal
        );
        this.items = new ItemController(model, this, isLocal);

        model.add(audio);

        this.update = [
            () => {
                keyboard.firstUpdate();

                isLocal && Global.cameraController.update();

                this.items.update();
                engine.update();
                model.update();

                this.tracker.update();
                keyboard.isLocked = this.tracker.round >= 1;

                keyboard.lastUpdate();
            },
        ];

        this.disconnect = () => {
            Global.lod.remove(model);
            Global.world.removeBody(this);

            Player.clients.delete(pid);
        };

        Global.world.addBody(this);
        Global.lod.add(model);
    }

    public applyTransform(transform: number[]) {
        [
            this.position.x,
            this.position.y,
            this.position.z,
            this.quaternion.x,
            this.quaternion.y,
            this.quaternion.z,
            this.quaternion.w,
        ] = transform;

        this.velocity.setZero();
        this.force.setZero();
    }
}
