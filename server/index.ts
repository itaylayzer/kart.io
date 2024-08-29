import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { CC, CS } from "./store/codes";
import cors from "cors";
import msgpack from "msgpack-lite";

const app = express();
const server = createServer(app);
const io = new Server(server);

type Player = {
  socket: Socket;
  pid: number;
  name: string;
};

app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("hi");
});
let nextId = 0;
const players = new Map<number, Player>();

const sockets = {
  emitAll(eventName: string, eventArgs: any) {
    for (const x of players.values()) {
      x.socket.emit(eventName, eventArgs);
    }
  },
  emitExcept(exceptID: number, eventName: string, eventArgs: any) {
    for (const x of players.values()) {
      x.pid !== exceptID && x.socket.emit(eventName, eventArgs);
    }
  },
};

io.on("connection", (socket) => {
  const pid = nextId;
  nextId++;
  let local: Player;
  socket.on(CS.JOIN, (name: string) => {
    local = { pid, socket, name };
    console.log(`User [${pid}] ${name} connected`);

    sockets.emitAll(CC.NEW_PLAYER, { name, pid });
    local.socket.emit(CC.INIT, [
      pid,
      Array.from(players.values()).map(({ pid, name }) => ({
        pid,
        name,
      })),
    ]);
    players.set(pid, local);
  });

  socket.on(CS.KEY_DOWN, (buffer: Buffer) => {
    sockets.emitExcept(pid, CC.KEY_DOWN, { pid, buffer });
  });

  socket.on(CS.KEY_UP, (buffer: Buffer) => {
    sockets.emitExcept(pid, CC.KEY_UP, { pid, buffer });
  });

  socket.on("disconnect", () => {
    players.delete(pid);
    sockets.emitAll(CC.DISCONNECTED, pid);
    console.log(`disconnected [${pid}]  `);
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
