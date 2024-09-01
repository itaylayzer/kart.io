import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { CC, CS } from "./store/codes";
import cors from "cors";
import setup from "./api/setup";
import msgpack from "msgpack-lite";

type Player = {
  socket: Socket;
  pid: number;
  name: string;
  transform: number[];
  color: string;
  ready: boolean;
};

const COLORS = ["red", "blue", "green", "white"];
export class Room {
  public close: () => void;
  public players: Map<number, Player>;
  public isGameStarted: () => boolean;
  constructor(port: number, public name, removeFromList: () => void) {
    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
      transports: ["websocket"],
    });

    const players = new Map<number, Player>();
    const { mysteryLocations, startsLocationsGenerator } = setup();
    let gameStarted = false;
    this.isGameStarted = () => gameStarted;
    let colorIndex = 0;
    const close = () => io.disconnectSockets(true);
    let nextId = 0;

    const randomColor = () => {
      return COLORS[colorIndex++ % COLORS.length];
    };

    app.use(cors());

    app.get("/", (req, res) => {
      res.status(200).send("hi");
    });

    const sockets = {
      emitAll(eventName: string, eventArgs?: any) {
        for (const x of players.values()) {
          x.socket.emit(eventName, eventArgs);
        }
      },
      emitExcept(exceptID: number, eventName: string, eventArgs?: any) {
        for (const x of players.values()) {
          x.pid !== exceptID && x.socket.emit(eventName, eventArgs);
        }
      },
    };

    io.on("connection", (socket) => {
      socket.timeout(1000);
      const pid = nextId;
      nextId++;
      let local: Player;

      socket.on(CS.INIT_GAME, () => {
        local.socket.emit(CC.INIT_GAME, [
          Array.from(players.entries()).map(([id, { transform }]) => [
            id,
            transform,
          ]),
          mysteryLocations,
        ]);
      });

      socket.on(CS.JOIN, (name: string) => {
        if (gameStarted) {
          socket.emit(CC.INIT, false);
          socket.disconnect();
          return;
        }
        const selfColor = randomColor();
        local = {
          pid,
          socket,
          name,
          transform: [],
          color: selfColor,
          ready: false,
        };

        sockets.emitAll(CC.NEW_PLAYER, [pid, name, selfColor]);
        local.socket.emit(CC.INIT, [
          pid,
          selfColor,
          Array.from(players.values()).map(({ pid, name, color, ready }) => [
            pid,
            name,
            color,
            ready,
          ]),
          mysteryLocations,
        ]);
        players.set(pid, local);
      });

      const updatePositionBasedBuffer = (buffer: Buffer, skip = 1) => {
        const array = msgpack.decode(new Uint8Array(buffer)) as number[];
        for (let index = 0; index < skip; index++) {
          array.shift();
        }
        if (array.length == 7) {
          local.transform = array;
        }
      };

      socket.on(CS.KEY_DOWN, (buffer: Buffer) => {
        sockets.emitExcept(pid, CC.KEY_DOWN, { pid, buffer });
        updatePositionBasedBuffer(buffer);
      });

      socket.on(CS.KEY_UP, (buffer: Buffer) => {
        sockets.emitExcept(pid, CC.KEY_UP, { pid, buffer });
        updatePositionBasedBuffer(buffer);
      });

      socket.on(CS.TOUCH_MYSTERY, (id: number) => {
        sockets.emitAll(CC.MYSTERY_VISIBLE, [id, false]);

        setTimeout(() => {
          sockets.emitAll(CC.MYSTERY_VISIBLE, [id, true]);
        }, 1000);
      });

      socket.on(CS.READY, (ready: boolean) => {
        local.ready = ready;
        sockets.emitAll(CC.READY, [pid, ready]);

        if (Array.from(players.values()).filter((a) => !a.ready).length !== 0)
          return;

        sockets.emitAll(CC.START_GAME);
        for (const player of players.values()) {
          gameStarted = true;
          player.transform = startsLocationsGenerator();
        }
      });

      socket.on("disconnect", () => {
        players.delete(pid);
        sockets.emitAll(CC.DISCONNECTED, pid);

        if (players.size === 0) {
          close();
          server.close();
          removeFromList();
        }
      });
    });

    server.listen(port, "0.0.0.0", () => {
      console.log("opend room on port ", port);
    });
    this.close = close;
    this.players = players;
  }
}
