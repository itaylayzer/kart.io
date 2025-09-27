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
import { TransformSchema } from "@schema/KartRaceState";

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
    public engine: DriveController;
    public turboMode: boolean;
    public rocketMode: boolean;
    public driftSide: number;
    public model: PlayerModel;
    public mushroomAddon: number;
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
        this.mushroomAddon = 0;

        this.tracker = new TrackerController(this, isLocal);
        this.color = color;
        Player.clients.set(pid, this);

        this.turboMode = false;
        this.driftSide = 0;

        const audio = new AudioController();
        this.engine = new DriveController(
            5,
            this,
            this.keyboard,
            audio,
            isLocal
        );
        this.model = new PlayerModel(
            this,
            keyboard,
            name,
            [color, colorSetEmissive],
            isLocal
        );
        this.items = new ItemController(this.model, this, isLocal);
        this.rocketMode = false;
        this.model.add(audio);

        this.update = [
            () => {
                keyboard.firstUpdate();

                isLocal && Global.cameraController.update();

                this.items.update();
                [
                    this.turboMode,
                    this.driftSide,
                    this.rocketMode,
                    this.mushroomAddon,
                ] = this.engine.update();
                this.model.update();

                this.tracker.update();
                keyboard.isLocked = this.tracker.shouldLock();
                isLocal &&
                    (Global.mouseController.isLocked = keyboard.isLocked);
                keyboard.lastUpdate();
            },
        ];

        this.disconnect = () => {
            Global.lod.remove(this.model);
            Global.world.removeBody(this);

            Player.clients.delete(pid);
        };

        Global.world.addBody(this);
        Global.lod.add(this.model);
    }
}
