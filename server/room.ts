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
};

export class Room {
  public close: () => void;
  public players: Map<number, Player>;
  constructor(port: number, public name) {
    const app = express();
    const server = createServer(app);
    const io = new Server(server);

    const { mysteryLocations, startsLocationsGenerator } = setup();

    app.use(cors());

    app.get("/", (req, res) => {
      res.status(200).send("hi");
    });
    let nextId = 0;
    this.players = new Map<number, Player>();

    const sockets = {
      emitAll(eventName: string, eventArgs: any) {
        for (const x of this.players.values()) {
          x.socket.emit(eventName, eventArgs);
        }
      },
      emitExcept(exceptID: number, eventName: string, eventArgs: any) {
        for (const x of this.players.values()) {
          x.pid !== exceptID && x.socket.emit(eventName, eventArgs);
        }
      },
    };

    io.on("connection", (socket) => {
      socket.timeout(1000);
      const pid = nextId;
      nextId++;
      let local: Player;
      socket.on(CS.JOIN, (name: string) => {
        const transform = startsLocationsGenerator();
        local = { pid, socket, name, transform };

        sockets.emitAll(CC.NEW_PLAYER, { name, pid, transform });
        local.socket.emit(CC.INIT, [
          pid,
          transform,
          Array.from(this.players.values()).map(({ pid, name, transform }) => ({
            pid,
            name,
            transform,
          })),
          mysteryLocations,
        ]);
        this.players.set(pid, local);
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

      socket.on("disconnect", () => {
        console.log(`room ${port} disconnected ${pid}`);
        this.players.delete(pid);
        sockets.emitAll(CC.DISCONNECTED, pid);
      });
    });

    server.listen(port, () => {});

    this.close = () => io.disconnectSockets(true);
  }
}
