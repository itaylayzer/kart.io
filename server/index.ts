import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { CC, CS } from "./store/codes";
import cors from "cors";
import { Player } from "./player/Player";
import { loadMeshes } from "./store/Assets";
import setup from "./api/setup/world";
import { Clock } from "three";
import { Global } from "./store/Global";
import { PhysicsObject } from "./physics/PhysicsMesh";
const app = express();
const server = createServer(app);
const io = new Server(server);

setup();

app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("hi");
});

Global.players = new Map<string, Player>();

Global.sockets = {
  emitAll(eventName: string, eventArgs: any) {
    for (const x of Global.players.values()) {
      x.socket.emit(eventName, eventArgs);
    }
  },
  emitExcept(exceptID: string, eventName: string, eventArgs: any) {
    for (const x of Global.players.values()) {
      x.pid !== exceptID && x.socket.emit(eventName, eventArgs);
    }
  },
};

io.on("connection", (socket) => {
  const id = socket.id;
  let local: Player;
  socket.on(CS.JOIN, (name: string) => {
    local = new Player(id, socket, name);
    console.log(`User ${name} connected`);

    Global.sockets.emitAll(CC.NEW_PLAYER, { name, id });
    local.socket.emit(CC.INIT, [
      id,
      Array.from(Global.players.values()).map(({ id, name }) => ({
        id,
        name,
      })),
    ]);
    Global.players.set(id, local);
  });

  socket.on(CS.KEY_DOWN, (key: string) => {
    Global.players.get(id)?.keyboard.keysDown.add(key);
  });

  socket.on(CS.KEY_UP, (key: string) => {
    Global.players.get(id)?.keyboard.keysUp.add(key);
    Global.players.get(id)?.keyboard.keysPressed.delete(key);
  });

  socket.on("disconnect", () => {
    Global.players.delete(id);
    Global.sockets.emitAll(CC.DISCONNECTED, id);
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

setup();
const clock = new Clock();

const animate = () => {
  Global.deltaTime = clock.getDelta();
  PhysicsObject.childrens.flatMap((v) => v.update).map((fn) => fn());
  Global.world.step(2.6 * Global.deltaTime);
};

setInterval(() => {
  animate();
}, 1000 / 120);
