import { GameContext } from "@/store/Context";
import { Group } from "three";
import { PhysicsObject } from "./PhysicsMesh";
import { PlayerSchema } from "@/rooms/schema/KartRaceState";
import * as CANNON from 'cannon-es';
import { DriveController } from "@/controllers/DriverController";
import { TrackerController } from "@/controllers/TrackerController";

export class PlayerEntity extends PhysicsObject {

    private engine: DriveController;
    public tracker: TrackerController;
    constructor(public context: GameContext, private schema: PlayerSchema) {

        const radius = 0.8 / 3;

        super(new Group(), {
            shape: new CANNON.Cylinder(radius, radius, radius),
            mass: 1,
            position: schema.startTransform.position.cannon(),
            material: new CANNON.Material({ friction: 0, restitution: 0 }),
            collisionFilterGroup: 1,
            collisionFilterMask: ~0,
        });

        this.tracker = new TrackerController(this);
        this.engine = new DriveController(
            5,
            this,
        );

        this.context.playersBodies.add(this.id);

        this.update.push(() => {
            this.engine.update();
            this.tracker.update();

        },

            this.matchEngines.bind(this));
    }


    setRocketModel(rockerModel: boolean) {
    }

    dispose() {
        this.context.playersBodies.delete(this.id);
    }
}