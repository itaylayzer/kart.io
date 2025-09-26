import { Room, Client, AuthContext, Delayed } from "@colyseus/core";
import { KartRaceState, PlayerSchema } from "./schema/KartRaceState";
import { roadUtils } from "@/utils/roadUtils";
import { KartScene } from "@/scenes/KartScene";
import { CS } from "@shared/types/codes";

export class KartRace extends Room<KartRaceState, { hasPassword: boolean, roomName: string }> {
  maxClients = 16;
  autoDispose = false;
  state = new KartRaceState();
  private scene: KartScene;
  private password: string;
  private firstJoinTimer: Delayed;


  onAuth(client: Client<any, any>, options: any, context: AuthContext) {
    console.log('clients', client.sessionId, 'attempts to join with options', options)
    if (this.password.length > 0 && options.password !== this.password) {
      client.leave(1);
      return false;
    }

    return true;
  }

  onCreate(options: { mapId: number, password: string, roomName: string }) {
    console.log("room", this.roomId, "created:", JSON.stringify(options, null, 4));

    this.firstJoinTimer = this.clock.setTimeout(() => {
      this.autoDispose = true;
      this.disconnect(); // triggers dispose when empty
    }, 60_000);

    this.setMetadata({ hasPassword: options.password.length > 0, roomName: options.roomName })

    this.state.mapId = options.mapId;
    this.password = options.password;

    this.onMessage(CS.READY, (client, ready) => {
      const xplayer = this.state.players.get(client.sessionId);
      xplayer.assign({ ready });

      console.log('CS.READY', client.sessionId, "from:", xplayer.ready, "to:", !xplayer.ready)
      this.state.players.set(client.sessionId, xplayer.clone());

      if (Array.from(this.state.players.values()).filter(player => !player.ready).length === 0) {
        this.onGameStart();
        this.lock();
      }
    });
  }

  onGameStart() {
    this.state.startTime = Date.now() + 5_000;

    this.scene = new KartScene(this.state.mapId, this.state.mysteries, this.state.players);
  }

  onJoin(client: Client, options: { playerName: string }) {
    console.log(client.sessionId, "joined!");
    this.state.players.set(client.sessionId, new PlayerSchema().assign({ ready: false, name: options.playerName, color: this.state.players.size, id: client.sessionId }))

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
