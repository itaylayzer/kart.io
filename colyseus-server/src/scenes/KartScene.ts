import { MysteryBoxSchema, PlayerSchema } from "@/rooms/schema/KartRaceState";
import { World } from "cannon-es";
import { Scene } from "three";
import { ArraySchema, MapSchema } from "@colyseus/schema";
import { roadUtils } from "@/utils/roadUtils";
import { PlayerEntity } from "@/entities/PlayerEntity";

export class KartScene {
    private scene: Scene;
    private world: World;
    private players: Map<string, PlayerEntity>;

    constructor(mapId: number, mysteries: ArraySchema<MysteryBoxSchema>, playersSchema: MapSchema<PlayerSchema>) {
        const road = roadUtils(mapId);
        road.mysteries(mysteries);

        this.scene = new Scene();
        this.world = new World()

        this.players = new Map();
        for (const key of playersSchema.keys()) {
            this.players.set(key, new PlayerEntity(this.scene, this.world));
        }
    }

    update() {
        this.world.step(1 / 60);
    }

    onLeave(id: string) {
        const playerEntity = this.players.get(id);
        playerEntity.dispose();

        this.players.delete(id);
    }

    dispose() {
        this.scene.clear();
    }
}