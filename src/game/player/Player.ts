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

type State = {
    pos: THREE.Vector3Like,
    quat: THREE.QuaternionLike, timestamp: number
}

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
    public unpackPackage: (time: number, transform: number[]) => void;
    private tickBehind: number;
    applyTransform: (transform: number[]) => void;
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


        this.tickBehind = 0;
        let stateBuffer: State[] = []

        const interpolate = (timeInThePast: number) => {
            if (stateBuffer.length < 1) {
                return
            }



            let firstStateIndex = -1
            let secondStateIndex = -1

            for (let i = 0; i < stateBuffer.length; i++) {
                const state = stateBuffer[i];
                if (state.timestamp > timeInThePast) {
                    firstStateIndex = i - 1
                    secondStateIndex = i
                    break;
                }
            }

            const firstState = stateBuffer[firstStateIndex];
            const secondState = stateBuffer[secondStateIndex];

            if (!firstState) {
                return
            }


            this.position.set(firstState.pos.x, firstState.pos.y, firstState.pos.z)
            this.quaternion.set(firstState.quat.x, firstState.quat.y, firstState.quat.z, firstState.quat.w)

            if (!secondState) {//We don't have two states to interpolate between
                return
            }


            const alpha = (timeInThePast - firstState.timestamp) / (secondState.timestamp - firstState.timestamp)
            this.position.lerp(new CANNON.Vec3(secondState.pos.x, secondState.pos.y, secondState.pos.z), alpha, this.position);
            this.quaternion.slerp(new CANNON.Quaternion(secondState.quat.x, secondState.quat.y, secondState.quat.z, secondState.quat.w), alpha, this.quaternion);
        }


        this.update = [
            () => {

                keyboard.firstUpdate();

                const timestamp = Date.now();
                const currentTimeMinusLatency = timestamp - Global.letancy;
                const currentTimeMinusLatencyAndInterpolationDelay = currentTimeMinusLatency - Global.letancy;

                interpolate(currentTimeMinusLatencyAndInterpolationDelay);
                isLocal && Global.cameraController.update();


                this.model.update();
                keyboard.lastUpdate();
                this.tickBehind++;
            },
        ];

        this.disconnect = () => {
            Global.lod.remove(this.model);
            Global.world.removeBody(this);

            Player.clients.delete(pid);
        };

        Global.lod.add(this.model);


        this.unpackPackage = (timestamp, transform) => {
            this.tickBehind = 0;

            const pos = new THREE.Vector3();
            const quat = new THREE.Quaternion();

            [
                pos.x,
                pos.y,
                pos.z,
                quat.x,
                quat.y,
                quat.z,
                quat.w,
            ] = transform;

            stateBuffer.push({ timestamp, pos, quat: quat })
            stateBuffer.sort((a, b) => {
                return a.timestamp - b.timestamp;
            });
            if (stateBuffer.length > 60) {
                stateBuffer.splice(0, 1)
            }

        }


        this.applyTransform = (transform: number[]) => {

            [
                this.position.x,
                this.position.y,
                this.position.z,
                this.quaternion.x,
                this.quaternion.y,
                this.quaternion.z,
                this.quaternion.w,
            ] = transform;



        }

    }

}