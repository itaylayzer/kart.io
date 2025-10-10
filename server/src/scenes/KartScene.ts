import { MysteryBoxSchema, PlayerSchema } from "@/rooms/schema/KartRaceState";
import { CatmullRomCurve3, Clock, Scene } from "three";
import { ArraySchema, MapSchema } from "@colyseus/schema";
import { PlayerEntity } from "@/entities/PlayerEntity";
import { GameContext } from "@/store/Context";
import * as CANNON from "cannon-es";
import { createRoad } from "@/utils/meshes/createRoad";
import { MysteryBoxEntity } from "@/entities/MysteryBoxEntity";
import { TrackerController } from "@/controllers/TrackerController";

export class KartScene {
    private players: Map<string, PlayerEntity>;
    private context: GameContext;
    private clock: Clock;

    constructor(curve: CatmullRomCurve3, mysteries: ArraySchema<MysteryBoxSchema>, playersSchema: MapSchema<PlayerSchema>) {
        const fullRoadsSegments = createRoad(curve, 5, 50, 3000);

        this.context = {
            curve,
            deltaTime: 0,
            elapsedTime: 0,
            lateUpdates: [],
            roadMesh: fullRoadsSegments,
            updates: [],
            scene: new Scene(),
            world: new CANNON.World(),
            playersBodies: new Set<number>(),
            trackerPoints: curve.getPoints(TrackerController.ls)

        }

        this.context.trackerPoints.pop();

        this.context.world = new CANNON.World();
        this.context.world.gravity = new CANNON.Vec3(0, 0, 0);
        this.context.world.allowSleep = true;
        this.context.world.broadphase = new CANNON.SAPBroadphase(this.context.world);

        this.context.scene.add(...fullRoadsSegments);

        this.players = new Map();
        for (const key of playersSchema.keys()) {
            this.players.set(key, new PlayerEntity(this.context, playersSchema.get(key)!));
        }
        for (const mysterySchema of mysteries) {
            new MysteryBoxEntity(this.context, mysterySchema);
        }

        this.clock = new Clock();
    }

    update() {
        this.context.deltaTime = this.clock.getDelta();
        this.context.elapsedTime = this.clock.getElapsedTime();

        this.context.updates
            .concat(Array.from(this.players.values()).flatMap((player) => player.update))
            .forEach(updatefn => updatefn());

        this.context.world.step(2.6 * this.context.deltaTime);
    }

    onLeave(id: string) {
        const playerEntity = this.players.get(id);
        playerEntity.dispose();

        this.players.delete(id);
    }

    dispose() {
        this.context.scene.clear();
        this.context.world.bodies.forEach((body) =>
            this.context.world.removeBody(body)
        );
    }
}