import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { CC, CS } from "./types/codes";
import cors from "cors";
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(cors());

app.get("/", (req, res) => {
    res.status(200).send("hi");
});

interface Player {
    socket: Socket;
    name: string;
    id: string;
}

const players = new Map<string, Player>();

const sockets = {
    emitAll(eventName: string, eventArgs: any) {
        for (const x of players.values()) {
            x.socket.emit(eventName, eventArgs);
        }
    },
    emitExcept(exceptID: string, eventName: string, eventArgs: any) {
        for (const x of players.values()) {
            x.id !== exceptID && x.socket.emit(eventName, eventArgs);
        }
    },
};

io.on("connection", (socket) => {
    const id = socket.id;
    let local: Player;
    socket.on(CS.JOIN, (name: string) => {
        local = { name, socket, id: socket.id };
        console.log(`User ${name} connected`);

        sockets.emitAll(CC.NEW_PLAYER, { name, id });
        local.socket.emit(
            CC.INIT,
            Array.from(players.values()).map(({ id, name }) => ({
                id,
                name,
            }))
        );

        players.set(id, local);
    });

    socket.on(CS.UPDATE, (pack) => {
        sockets.emitExcept(id, CC.UPDATE, { id, ...pack });
    });

    socket.on("disconnect", () => {
        players.delete(id);
        sockets.emitAll(CC.DISCONNECTED, id);

        console.log(`User ${local.name} disconnected`);
    });
});

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
