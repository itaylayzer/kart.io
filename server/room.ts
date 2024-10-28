import { Server as HTTPServer } from "https";
import { Server as SocketIOServer } from "socket.io";
import { CC, CS } from "./store/codes";
import msgpack from "msgpack-lite";
import { randInt } from "three/src/math/MathUtils.js";
import { Player } from "./player/Player";
import { Game } from "./game/game";
import { useSockets } from "./hooks/useSockets";


const COLORS_LENGTH = 8;
export class Room {
    static io: SocketIOServer;

    static initialize(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            transports: ["websocket"],
            cors: { origin: "*" },
        });
    }
    public close: () => void;

    constructor(
        namespace: string,
        public name,
        removeFromList: () => void,
        public password: string | undefined,
        mapIndex: number = 0
    ) {
        const io = Room.io.of("/room/" + namespace);
        const game = new Game(mapIndex);


        let colorIndex = 0;
        const close = () => io.disconnectSockets(true);
        let nextId = 0;

        const randomColor = () => {
            return colorIndex++ % COLORS_LENGTH;
        };

        let startTime = 0;

        const { emitAll, emitExcept } = useSockets(game.state.players);

        io.on("connection", (socket) => {
            socket.timeout(1000);
            const pid = nextId;
            nextId++;
            let local: Player;

            socket.on(CS.INIT_GAME, () => {
                local.info.socket.emit(CC.INIT_GAME, [
                    Array.from(game.state.players.entries()).map(([id, { info }]) => [
                        id,
                        info.transform,
                    ]),
                    game.getMysteryLocations(),
                    startTime,
                ]);
            });

            socket.on(CS.JOIN, (name: string) => {
                if (game.isGameStarted()) {
                    socket.emit(CC.INIT, false);
                    socket.disconnect();
                    return;
                }
                if (
                    this.password !== undefined &&
                    socket.handshake.query.password !== this.password
                ) {
                    socket.emit(CC.INIT, true);
                    socket.disconnect();
                    return;
                }
                const selfColor = randomColor();
                local = new Player({
                    pid,
                    socket,
                    name,
                    transform: [],
                    color: selfColor,
                    ready: false,
                    finish: false,
                }, game.state);

                emitAll(CC.NEW_PLAYER, [pid, name, selfColor]);
                local.info.socket.emit(CC.INIT, [
                    pid,
                    mapIndex,
                    selfColor,
                    Array.from(game.state.players.values()).map(p => p.info).map(
                        ({ pid, name, color, ready }) => [
                            pid,
                            name,
                            color,
                            ready,
                        ]
                    ),
                    game.getMysteryLocations(),
                ]);
                game.state.players.set(pid, local);
            });

            const updatePositionBasedBuffer = (buffer: Buffer, skip = 1) => {
                const array = msgpack.decode(
                    new Uint8Array(buffer)
                ) as number[];
                for (let index = 0; index < skip; index++) {
                    array.shift();
                }
                if (array.length == 7) {
                    local.info.transform = array;
                }
            };

            socket.on(CS.KEY_DOWN, (buffer: Buffer) => {
                emitExcept(pid, CC.KEY_DOWN, { pid, buffer });
                updatePositionBasedBuffer(buffer);
            });

            socket.on(CS.KEY_UP, (buffer: Buffer) => {
                emitExcept(pid, CC.KEY_UP, { pid, buffer });
                updatePositionBasedBuffer(buffer);
            });

            socket.on(CS.TOUCH_MYSTERY, (id: number) => {
                emitAll(CC.MYSTERY_VISIBLE, [id, false]);
                socket.emit(CC.MYSTERY_ITEM, randInt(0, 4));
                setTimeout(() => {
                    emitAll(CC.MYSTERY_VISIBLE, [id, true]);
                }, 1000);
            });

            socket.on(CS.READY, (ready: boolean) => {
                local.info.ready = ready;
                emitAll(CC.READY, [pid, ready]);

                if (
                    Array.from(game.state.players.values()).filter((p) => !p.info.ready)
                        .length !== 0
                )
                    return;

                startTime = new Date().getTime() + 5000;

                emitAll(CC.START_GAME);
                game.startGame(startTime);

            });
            socket.on(CS.APPLY_MYSTERY, (data: number[]) => {
                emitAll(CC.APPLY_MYSTERY, [pid, ...data]);
            });
            socket.on(CS.UPDATE_TRANSFORM, (buffer: Buffer) => {
                emitExcept(pid, CC.UPDATE_TRANSFORM, buffer);
            });

            socket.on(CS.FINISH_LINE, () => {
                emitAll(CC.FINISH_LINE, pid);

                local.info.finish = true;

                const allFinishes = Array.from(game.state.players.values()).map(
                    (v) => v.info.finish
                );

                const allFinished =
                    allFinishes.filter((v) => v === false).length === 0;

                if (allFinished) {
                    emitAll(CC.SHOW_WINNERS, pid);
                }
            });

            socket.on("disconnect", () => {
                game.playerDisconnected(pid);
                emitAll(CC.DISCONNECTED, pid);

                if (game.state.players.size === 0) {
                    close();

                    removeFromList();
                }
            });
        });

        this.close = close;
    }
}
