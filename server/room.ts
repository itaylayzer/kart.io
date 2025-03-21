import { Server as HTTPServer } from "https";
import { Server as SocketIOServer, Socket } from "socket.io";
import { CC, CS } from "./store/codes";
import setup from "./api/setup";
import msgpack from "msgpack-lite";
import { randInt } from "three/src/math/MathUtils.js";

type Player = {
	socket: Socket;
	pid: number;
	name: string;
	transform: number[];
	color: number;
	ready: boolean;
	finish: boolean;
};

const COLORS_LENGTH = 8;
export class Room {
	static io: SocketIOServer;
	static initialize(server: HTTPServer) {
		this.io = new SocketIOServer(server, {
			transports: ["websocket"],
			cors: { origin: process.env.ORIGIN },
		});
	}
	public close: () => void;
	public players: Map<number, Player>;
	public isGameStarted: () => boolean;

	constructor(
		namespace: string,
		public name,
		removeFromList: () => void,
		public password: string | undefined,
		mapIndex: number = 0
	) {
		const io = Room.io.of("/room/" + namespace);

		const players = new Map<number, Player>();
		const { mysteryLocations, startsLocationsGenerator } = setup(mapIndex);
		let gameStarted = false;
		this.isGameStarted = () => gameStarted;
		let colorIndex = 0;
		const close = () => io.disconnectSockets(true);
		let nextId = 0;

		const randomColor = () => {
			return colorIndex++ % COLORS_LENGTH;
		};

		let startTime = 0;
		const sockets = () => ({
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
		});

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
					startTime,
				]);
			});

			socket.on(CS.JOIN, (name: string) => {
				if (gameStarted) {
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
				local = {
					pid,
					socket,
					name,
					transform: [],
					color: selfColor,
					ready: false,
					finish: false,
				};

				sockets().emitAll(CC.NEW_PLAYER, [pid, name, selfColor]);
				local.socket.emit(CC.INIT, [
					pid,
					mapIndex,
					selfColor,
					Array.from(players.values()).map(
						({ pid, name, color, ready }) => [
							pid,
							name,
							color,
							ready,
						]
					),
					mysteryLocations,
				]);
				players.set(pid, local);
			});

			const updatePositionBasedBuffer = (buffer: Buffer, skip = 1) => {
				const array = msgpack.decode(
					new Uint8Array(buffer)
				) as number[];
				for (let index = 0; index < skip; index++) {
					array.shift();
				}
				if (array.length == 7) {
					local.transform = array;
				}
			};

			socket.on(CS.KEY_DOWN, (buffer: Buffer) => {
				sockets().emitExcept(pid, CC.KEY_DOWN, { pid, buffer });
				updatePositionBasedBuffer(buffer);
			});

			socket.on(CS.KEY_UP, (buffer: Buffer) => {
				sockets().emitExcept(pid, CC.KEY_UP, { pid, buffer });
				updatePositionBasedBuffer(buffer);
			});

			socket.on(CS.TOUCH_MYSTERY, (id: number) => {
				sockets().emitAll(CC.MYSTERY_VISIBLE, [id, false]);
				socket.emit(CC.MYSTERY_ITEM, randInt(0, 4));
				setTimeout(() => {
					sockets().emitAll(CC.MYSTERY_VISIBLE, [id, true]);
				}, 1000);
			});

			socket.on(CS.READY, (ready: boolean) => {
				local.ready = ready;
				sockets().emitAll(CC.READY, [pid, ready]);

				if (
					Array.from(players.values()).filter((a) => !a.ready)
						.length !== 0
				)
					return;

				startTime = new Date().getTime() + 5000;
				sockets().emitAll(CC.START_GAME);
				for (const player of players.values()) {
					gameStarted = true;
					player.transform = startsLocationsGenerator();
				}
			});
			socket.on(CS.APPLY_MYSTERY, (data: number[]) => {
				sockets().emitAll(CC.APPLY_MYSTERY, [pid, ...data]);
			});
			socket.on(CS.UPDATE_TRANSFORM, (buffer: Buffer) => {
				sockets().emitExcept(pid, CC.UPDATE_TRANSFORM, buffer);
			});

			socket.on(CS.FINISH_LINE, () => {
				sockets().emitAll(CC.FINISH_LINE, pid);

				local.finish = true;
				players.set(pid, local);

				const allFinishes = Array.from(players.values()).map(
					(v) => v.finish
				);

				const allFinished =
					allFinishes.filter((v) => v === false).length === 0;

				if (allFinished) {
					sockets().emitAll(CC.SHOW_WINNERS, pid);
				}
			});

			socket.on("disconnect", () => {
				players.delete(pid);
				sockets().emitAll(CC.DISCONNECTED, pid);

				if (players.size === 0) {
					close();

					removeFromList();
				}
			});
		});

		this.close = close;
		this.players = players;
	}
}
