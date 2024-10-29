import { Server as HTTPServer } from "https";
import { Server as SocketIOServer } from "socket.io";
import { CC, CS } from "./store/codes";
import { randInt } from "three/src/math/MathUtils.js";
import { Player } from "./player/Player";
import { Game } from "./game/game";
import { useSockets } from "./hooks/useSockets";
import { createIDGenerator } from "./api/Generators/idGenerator";
import { createColorGenerator } from "./api/Generators/rangeGenerator";


export class Room {
    static io: SocketIOServer;
    static initialize(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            transports: ["websocket"],
            cors: { origin: "*" },
        });
    }

    public close: () => void;
    public game: Game;

    constructor(
        namespace: string,
        public name,
        removeFromList: () => void,
        public password: string | undefined,
        mapIndex: number = 0
    ) {
        const io = Room.io.of("/room/" + namespace);
        this.game = new Game(mapIndex);

        // Generators
        const idGenerator = createIDGenerator();
        const colorGenerator = createColorGenerator()

        // Close function
        this.close = () => {
            io.disconnectSockets(true);
            this.game.destroy()
        };

        let startTime = 0;
        const { emitAll, emitExcept } = useSockets(this.game.state.players);

        io.on("connection", (socket) => {
            socket.timeout(1000);
            const pid = idGenerator();
            let local: Player;

            socket.on(CS.INIT_GAME, () => {
                local.info.socket.emit(CC.INIT_GAME, [
                    Array.from(this.game.state.players.entries()).map(([id, { info }]) => [
                        id,
                        info.transform,
                    ]),
                    this.game.getMysteryLocations(),
                    startTime,
                ]);
            });

            socket.on(CS.JOIN, (name: string) => {
                if (this.game.isGameStarted()) {
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
                const selfColor = colorGenerator();
                local = new Player({
                    pid,
                    socket,
                    name,
                    transform: [],
                    color: selfColor,
                    ready: false,
                    finish: false,
                }, this.game.state);

                emitAll(CC.NEW_PLAYER, [pid, name, selfColor]);
                local.info.socket.emit(CC.INIT, [
                    pid,
                    mapIndex,
                    selfColor,
                    Array.from(this.game.state.players.values()).map(p => p.info).map(
                        ({ pid, name, color, ready }) => [
                            pid,
                            name,
                            color,
                            ready,
                        ]
                    ),
                    this.game.getMysteryLocations(),
                ]);
                this.game.state.players.set(pid, local);
            });


            // Input handeling
            socket.on(CS.KEY_DOWN, (key: number) => {
                local.keyboard.keysDown.add(key);
            });

            socket.on(CS.KEY_UP, (key: number) => {
                local.keyboard.keysPressed.delete(key);
                local.keyboard.keysUp.add(key);
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
                    Array.from(this.game.state.players.values()).filter((p) => !p.info.ready)
                        .length !== 0
                )
                    return;

                startTime = new Date().getTime() + 1000;

                emitAll(CC.START_GAME);
                this.game.startGame(startTime);

            });
            socket.on(CS.APPLY_MYSTERY, (data: number[]) => {
                emitAll(CC.APPLY_MYSTERY, [pid, ...data]);
            });


            socket.on(CS.FINISH_LINE, () => {
                emitAll(CC.FINISH_LINE, pid);

                local.info.finish = true;

                const allFinishes = Array.from(this.game.state.players.values()).map(
                    (v) => v.info.finish
                );

                const allFinished =
                    allFinishes.filter((v) => v === false).length === 0;

                if (allFinished) {
                    emitAll(CC.SHOW_WINNERS, pid);
                }
            });

            socket.on("disconnect", () => {
                this.game.playerDisconnected(pid);
                emitAll(CC.DISCONNECTED, pid);

                if (this.game.state.players.size === 0) {
                    this.close();

                    removeFromList();
                }
            });
        });
    }
}
