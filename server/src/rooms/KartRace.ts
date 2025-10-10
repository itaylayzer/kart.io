import { Room, Client, AuthContext, Delayed } from "@colyseus/core";
import { KartRaceState, PlayerSchema, TransformSchema } from "./schema/KartRaceState";
import { roadUtils as RoadUtils } from "@/utils/roadUtils";
import { KartScene } from "@/scenes/KartScene";
import { CC, CS } from "@shared/types/codes";
import { MathUtils } from "three";

export class KartRace extends Room<
  KartRaceState,
  { hasPassword: boolean; roomName: string }
> {
  maxClients = 16;
  autoDispose = false;
  state = new KartRaceState();

  private roadUtils: ReturnType<typeof RoadUtils>;
  private scene: KartScene;
  private password: string;
  private firstJoinTimer: Delayed;
  private starters: TransformSchema[] = [];
  private starterGenerator: ReturnType<ReturnType<typeof RoadUtils>['positionsGenerator']>


  onAuth(client: Client<any, any>, options: any, context: AuthContext) {
    console.log(
      "clients",
      client.sessionId,
      "attempts to join with options",
      options
    );
    if (this.password.length > 0 && options.password !== this.password) {
      client.leave(1);
      return false;
    }

    return true;
  }

  onCreate(options: { mapId: number; password: string; roomName: string }) {
    console.log(
      "room",
      this.roomId,
      "created:",
      JSON.stringify(options, null, 4)
    );

    this.firstJoinTimer = this.clock.setTimeout(() => {
      this.autoDispose = true;
      this.disconnect(); // triggers dispose when empty
    }, 60_000);

    this.setMetadata({
      hasPassword: options.password.length > 0,
      roomName: options.roomName,
    });
    this.roadUtils = RoadUtils(options.mapId);
    this.starterGenerator = this.roadUtils.positionsGenerator();


    this.state.mapId = options.mapId;
    this.password = options.password;

    this.onMessage(CS.READY, (client, ready) => {
      const xplayer = this.state.players.get(client.sessionId);
      xplayer.assign({ ready });

      console.log(
        "CS.READY",
        client.sessionId,
        "from:",
        xplayer.ready,
        "to:",
        !xplayer.ready
      );
      this.state.players.set(client.sessionId, xplayer.clone());

      if (
        Array.from(this.state.players.values()).filter(
          (player) => !player.ready
        ).length === 0
      ) {
        this.onGameStart();
        this.lock();
      }
    });

    this.onMessage(CS.TOUCH_MYSTERY, (client, id: number) => {
      const toggleMystery = (id: number, visible: boolean) => {
        this.state.mysteries[id] = this.state.mysteries[id]
          .assign({ visible })
          .clone();
      };
      toggleMystery(id, false);

      client.send(CC.MYSTERY_ITEM, MathUtils.randInt(0, 4));

      setTimeout(() => {
        toggleMystery(id, true);
      }, 1000);
    });

    const getPID = (client: Client) =>
      this.state.players.get(client.sessionId).color;

    this.onMessage(CS.KEY_DOWN, (client, buffer: Buffer) => {
      this.clients.forEach(
        (c) =>
          c.sessionId !== client.sessionId &&
          c.send(CC.KEY_DOWN, { pid: getPID(client), buffer })
      );
    });

    this.onMessage(CS.KEY_UP, (client, buffer: Buffer) => {
      this.clients.forEach(
        (c) =>
          c.sessionId !== client.sessionId &&
          c.send(CC.KEY_UP, { pid: getPID(client), buffer })
      );
    });

    this.onMessage(CS.APPLY_MYSTERY, (client, data: number[]) => {
      this.clients.forEach((c) =>
        c.send(CC.APPLY_MYSTERY, [getPID(client), ...data])
      );
    });

    this.onMessage(CS.UPDATE_TRANSFORM, (client, buffer: Buffer) => {
      this.clients.forEach(
        (c) =>
          c.sessionId !== client.sessionId &&
          c.send(CC.UPDATE_TRANSFORM, buffer)
      );
    });

    this.onMessage(CS.FINISH_LINE, (client) => {
      this.clients.forEach((c) => c.send(CC.FINISH_LINE, getPID(client)));

      this.state.players.set(client.sessionId, this.state.players.get(client.sessionId).assign({ finished: true }));

      const allFinishes = Array.from(this.state.players.values()).map(
        (v) => v.finished
      );

      const allFinished =
        allFinishes.filter((v) => !v).length === 0;

      if (allFinished) {
        this.clients.forEach((c) => c.send(CC.SHOW_WINNERS, getPID(client)));
      }
    });

    // this.setSimulationInterval(() => {
    //   this.players.forEach((player, key) => {
    //     const [doUpdate, position, tick] = player.update(1 / 60);

    //     if (doUpdate) {
    //       this.players.forEach((_, otherKey) => {
    //         try {
    //           const data = [key, position] as any[];
    //           if (key === otherKey) data.push(tick);
    //           this.clients
    //             .getById(otherKey)
    //             .send(ClientCodes.POSITION_UPDATE, data);
    //         } catch { }
    //       });
    //     }
    //   });
    // })
  }

  onGameStart() {
    this.state.startTime = Date.now() + 5_000;

    this.scene = new KartScene(
      this.roadUtils.curve,
      this.state.mysteries,
      this.state.players
    );

    this.clock.setTimeout(() => {
      this.clients.forEach((client) => client.send(CC.START_GAME));
    }, this.patchRate * 0);
  }

  onJoin(client: Client, options: { playerName: string }) {
    console.log(client.sessionId, "joined!");
    this.state.players.set(
      client.sessionId,
      new PlayerSchema().assign({
        ready: false,
        name: options.playerName,
        color: this.state.players.size,
        id: client.sessionId,
        finished: false,
      })
    );

    if (this.state.players.size > this.starters.length) {
      const startTransform = this.starterGenerator();
      this.state.players.set(client.sessionId, this.state.players.get(client.sessionId).assign({ startTransform }));
      this.starters.push(startTransform);
    } else {
      const startTransform = this.starters[this.state.players.size - 1];
      this.state.players.set(client.sessionId, this.state.players.get(client.sessionId).assign({ startTransform }));
    }

    this.firstJoinTimer.clear();
    this.autoDispose = true;
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);

    this.scene?.onLeave(client.sessionId);

    if (this.state.players.size === 0) {
      this.disconnect();
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.scene?.dispose();
  }
}
