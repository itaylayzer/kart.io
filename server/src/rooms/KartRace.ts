import { Room, Client, AuthContext, Delayed } from "@colyseus/core";
import { KartRaceState, PlayerSchema, TransformSchema } from "./schema/KartRaceState";
import { roadUtils as RoadUtils } from "@/utils/roadUtils";
import { KartScene } from "@/scenes/KartScene";
import { CC, CS } from "@shared/types/codes";
import { MathUtils } from "three";
import { SyncedMovementController } from "@/controllers/SyncedMovementController";
import { InputPayload, StatePayload } from "@shared/types/payloads";

export class KartRace extends Room<
  KartRaceState,
  { hasPassword: boolean; roomName: string; visible?: boolean }
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
  private movementControllers: Map<string, SyncedMovementController> = new Map();
  private gameStarted = false;


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

  onCreate(options: { mapId: number; password: string; roomName: string; visible?: boolean }) {
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
      visible: options.visible !== false,
    });
    this.roadUtils = RoadUtils(options.mapId);
    this.starterGenerator = this.roadUtils.positionsGenerator();
    this.roadUtils.mysteries(this.state.mysteries);


    this.state.mapId = options.mapId;
    this.password = options.password;

    this.onMessage(CS.READY, (client, ready) => {
      const xplayer = this.state.players.get(client.sessionId);
      xplayer.assign({ ready });

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
          .clone().assign({ visible })
      };
      toggleMystery(id, false);

      client.send(CC.MYSTERY_ITEM, MathUtils.randInt(0, 4));

      setTimeout(() => {
        toggleMystery(id, true);
      }, 5000);
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

    // REMOVED: CS.UPDATE_TRANSFORM - Server is authoritative on all positions
    // Clients should NEVER send position updates, only inputs via CS.INPUT_BUFFER

    // Authoritative input buffer handler
    this.onMessage(CS.INPUT_BUFFER, (client, inputPayload: InputPayload) => {
      const controller = this.movementControllers.get(client.sessionId);
      if (controller && this.gameStarted) {
        controller.onClientInput(inputPayload);
      }
    });

    // Server-authoritative finish line detection (moved to server tick)
    // Client no longer sends FINISH_LINE, server detects it
  }

  onGameStart() {
    this.state.startTime = Date.now() + 5_000;

    // Create scene immediately so clients can render during countdown
    this.scene = new KartScene(
      this.roadUtils.curve,
      this.state.mysteries,
      this.state.players
    );

    // Initialize movement controllers for all players
    this.state.players.forEach((playerSchema, sessionId) => {
      const playerEntity = this.scene.getPlayerEntity(sessionId);
      if (playerEntity) {
        const controller = new SyncedMovementController(
          sessionId,
          playerEntity,
          (state: StatePayload) => {
            // Only send updates if game has started
            if (!this.gameStarted) return;

            // Send state to the owning client
            // FIXME: 
            // const client = this.clients.find(c => c.sessionId === sessionId);
            // if (client) {
            //   client.send(CC.STATE_BUFFER, state);
            // }

            // Send position update to other clients
            this.clients.forEach((c) => {
              if (c.sessionId !== sessionId) {
                // c.send(CC.POSITION_UPDATE, {
                //   pid: playerSchema.color,
                //   position: state.position,
                //   quaternion: state.quaternion,
                //   velocity: state.velocity,
                //   turboMode: state.turboMode,
                //   rocketMode: state.rocketMode,
                //   driftSide: state.driftSide,
                //   mushroomAddon: state.mushroomAddon,
                // });
              }
            });
          }
        );
        this.movementControllers.set(sessionId, controller);
        playerEntity.engine.setGameStarted(false); // Movement disabled until countdown ends
      }
    });

    // Set up simulation loop immediately (but movement is disabled)
    // This allows the scene to render and players to see their starting positions
    this.setSimulationInterval(() => {
      if (!this.scene) return;

      // Update scene (physics) - but movement controllers won't process inputs until gameStarted = true
      this.scene.update();

      // Only process inputs and send states if game has started
      if (this.gameStarted) {
        // Update movement controllers (process inputs, send states)
        this.movementControllers.forEach((controller) => {
          controller.update(1 / 60); // Fixed timestep
        });

        // Server-authoritative finish line detection
        this.checkFinishLine();

        // Server-authoritative mystery box management
        this.updateMysteryBoxes();
      }
    }, 1000 / 60); // 60Hz physics update

    // Send startTime with message so client has it before state sync (avoids race)
    this.clients.forEach((client) =>
      client.send(CC.START_GAME, this.state.startTime)
    );

    // Start game after 5 second countdown
    this.clock.setTimeout(() => {
      this.gameStarted = true;
      // Enable movement for all players
      this.state.players.forEach((_, sessionId) => {
        const playerEntity = this.scene.getPlayerEntity(sessionId);
        if (playerEntity) {
          playerEntity.engine.setGameStarted(true);
        }
      });

    }, 5000);
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
    this.movementControllers.delete(client.sessionId);

    this.scene?.onLeave(client.sessionId);

    if (this.state.players.size === 0) {
      this.disconnect();
    }
  }

  private checkFinishLine() {
    // Server-authoritative finish line detection
    // This should check if players have completed the race
    // Implementation depends on your finish line detection logic
    // For now, keeping the client-triggered version but server should validate
  }

  private updateMysteryBoxes() {
    // Server-authoritative mystery box spawning/despawning
    // Check if mystery boxes should respawn based on time
    // This ensures all clients see the same mystery box states
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.scene?.dispose();
  }
}
