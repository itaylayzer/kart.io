import { Room, Client, AuthContext, Delayed } from "@colyseus/core";
import { KartRaceState, PlayerSchema } from "./schema/KartRaceState";
import { roadUtils as RoadUtils } from "@/utils/roadUtils";
import { KartScene } from "@/scenes/KartScene";
import { CC, CS, KCS, KCC } from "@shared/types/codes";
import { MathUtils, Vector3 } from "three";
import { InputPayload, StatePayload } from "@shared/types/payloads";

export class KartRace extends Room<
    KartRaceState,
    { hasPassword: boolean; roomName: string }
> {
    maxClients = 16;
    autoDispose = false;
    state = new KartRaceState();
    private roadUtils: ReturnType<typeof RoadUtils>;
    private spawnGenerator: ReturnType<ReturnType<typeof RoadUtils>["positionsGenerator"]>;
    private scene: KartScene;
    private password: string;
    private firstJoinTimer: Delayed;

    private readonly serverTickRate = 60;
    private readonly dt = 1 / this.serverTickRate;

    onAuth(client: Client, options: any, _context: AuthContext) {
        if (this.password.length > 0 && options.password !== this.password) {
            client.leave(1);
            return false;
        }

        return true;
    }

    onCreate(options: { mapId: number; password: string; roomName: string }) {
        this.firstJoinTimer = this.clock.setTimeout(() => {
            this.autoDispose = true;
            this.disconnect();
        }, 60_000);

        this.setMetadata({
            hasPassword: options.password.length > 0,
            roomName: options.roomName,
        });

        this.roadUtils = RoadUtils(options.mapId);
        this.spawnGenerator = this.roadUtils.positionsGenerator();

        this.state.mapId = options.mapId;
        this.password = options.password;
        this.roadUtils.mysteries(this.state.mysteries);

        this.scene = new KartScene(
            this.state.mapId,
            this.state.mysteries,
            (pid, mysteryIndex) => this.handleMysteryTouched(pid, mysteryIndex),
            () => {}
        );

        this.setSimulationInterval(() => {
            this.scene.forEachPlayer((_sessionId, entity) => {
                entity.processInput(entity.getTick());
            });

            this.scene.step(this.dt);

            const states: StatePayload[] = [];
            this.scene.forEachPlayer((_sessionId, entity) => {
                const state = entity.getState(entity.getTick() - 1);
                if (state) {
                    states.push(state);
                }
            });

            if (states.length === 0) return;

            for (const client of this.clients) {
                for (const state of states) {
                    client.send(KCC.STATE_BUFFER, state);
                }
            }
        }, 1000 / this.serverTickRate);

        this.onMessage(CS.READY, (client, ready) => {
            const player = this.state.players.get(client.sessionId);
            player.assign({ ready });
            this.state.players.set(client.sessionId, player.clone());

            const allReady = Array.from(this.state.players.values()).every((p) => p.ready);
            if (allReady) {
                this.onGameStart();
                this.lock();
            }
        });

        this.onMessage(CS.APPLY_MYSTERY, (client, data: number[]) => {
            this.clients.forEach((c) =>
                c.send(CC.APPLY_MYSTERY, [this.state.players.get(client.sessionId).color, ...data])
            );
        });

        this.onMessage(CS.FINISH_LINE, (client) => {
            this.clients.forEach((c) =>
                c.send(CC.FINISH_LINE, this.state.players.get(client.sessionId).color)
            );

            const schema = this.state.players.get(client.sessionId);
            this.state.players.set(
                client.sessionId,
                schema.assign({ finished: true }).clone()
            );

            const allFinished = Array.from(this.state.players.values()).every((v) => v.finished);
            if (allFinished) {
                this.clients.forEach((c) =>
                    c.send(CC.SHOW_WINNERS, this.state.players.get(client.sessionId).color)
                );
            }
        });

        this.onMessage(KCS.INPUT_BUFFER, (client, payload: InputPayload) => {
            this.scene.onInput(client.sessionId, payload);
        });
    }

    onGameStart() {
        this.state.startTime = Date.now() + 5_000;

        const generator = this.roadUtils.positionsGenerator();
        this.spawnGenerator = this.roadUtils.positionsGenerator();
        this.state.players.forEach((player, key) => {
            const transform = generator();
            this.state.players.set(key, player.assign({ startTransform: transform }).clone());

            const entity = this.scene.getPlayer(key);
            if (entity) {
                const pos = transform.position;
                const quat = transform.quaternion;
                entity.setTransform(new Vector3(pos.x, pos.y, pos.z), {
                    x: quat.x,
                    y: quat.y,
                    z: quat.z,
                    w: quat.w,
                });
            }
        });

        this.clock.setTimeout(() => {
            this.clients.forEach((client) => client.send(CC.START_GAME));
        }, this.patchRate * 3);
    }

    onJoin(client: Client, options: { playerName: string }) {
        const startTransform = this.spawnGenerator();
        const player = new PlayerSchema().assign({
            ready: false,
            name: options.playerName,
            color: this.state.players.size,
            id: client.sessionId,
            finished: false,
            startTransform,
        }).clone();

        this.state.players.set(client.sessionId, player);

        const pos = startTransform.position;
        const quat = startTransform.quaternion;
        this.scene.addPlayer(
            client.sessionId,
            player.color,
            new Vector3(pos.x, pos.y, pos.z),
            { x: quat.x, y: quat.y, z: quat.z, w: quat.w }
        );

        this.firstJoinTimer.clear();
        this.autoDispose = true;
    }

    onLeave(client: Client) {
        this.state.players.delete(client.sessionId);
        this.scene.removePlayer(client.sessionId);

        if (this.state.players.size === 0) {
            this.disconnect();
        }
    }

    onDispose() {
        this.scene.dispose();
    }

    private handleMysteryTouched(pid: number, id: number) {
        const toggleMystery = (index: number, visible: boolean) => {
            this.state.mysteries[index] = this.state.mysteries[index].assign({ visible }).clone();
        };

        toggleMystery(id, false);

        const client = this.clients.find(
            (c) => this.state.players.get(c.sessionId)?.color === pid
        );
        client?.send(CC.MYSTERY_ITEM, MathUtils.randInt(0, 4));

        this.clock.setTimeout(() => toggleMystery(id, true), 1000);
    }
}
