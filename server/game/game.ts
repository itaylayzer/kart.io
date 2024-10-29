import { Player } from "../player/Player";
import { GameState } from "./GameState";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import setup from "../api/World/setup";
import { useSockets } from "../hooks/useSockets";
import { CC, CS } from "../store/codes";
import { GameTracker } from "./GameTracker";
import msgpack from "msgpack-lite"

export class Game {
	public state: GameState;

	public startGame: (time: number) => void;
	public isGameStarted: () => boolean;
	public getMysteryLocations: () => number[];
	public playerDisconnected: (xid: number) => void;
	public destroy: () => void;

	constructor(mapIndex: number) {
		const { mysteryLocations, startsLocationsGenerator, curve, roadsSegments } = setup(mapIndex);
		this.state = {
			scene: new THREE.Scene(),
			world: new CANNON.World(),
			players: new Map(),
			deltaTime: 1 / 60,
			elapsedTime: 0,
			roadsSegments,
			startTimerLocked: true,
			curve,
			tracker: new GameTracker(),
		};

		this.state.scene.add(...roadsSegments);
		this.state.scene.updateMatrixWorld(true);

		let intervalID: NodeJS.Timeout;
		this.state.world.gravity.set(0, 0, 0);
		let gameStarted = false;
		let elapsedUpdateTime = 0;

		const sendUpdatePackage = () => {
			const { emitAll } = useSockets(this.state.players);

			// trackers
			const trackers = this.state.tracker.sortedTrackers.map(v => v[0]);

			// player data
			const playersData: number[][] = [];
			for (const [pid, player] of this.state.players) {
				playersData.push([pid, ...player.pack()]);
			}

			const data = [Date.now(), trackers, ...playersData];

			// send to all
			emitAll(CC.UPDATE_TRANSFORM, (data));
		}

		const animate = () => {
			if (this.state.world === null) return;
			this.state.elapsedTime += this.state.deltaTime;
			elapsedUpdateTime += this.state.deltaTime;

			for (const p of this.state.players.values()) {
				p.update()
			}
			this.state.tracker.update();
			this.state.world.step(2.6 * this.state.deltaTime);

			// 20 packages in a minute
			if (elapsedUpdateTime >= 1 / 20) {
				elapsedUpdateTime = 0;

				// send update to clients
				sendUpdatePackage();
			}

		}


		this.startGame = (startTime) => {
			setTimeout(() => {
				intervalID = setInterval(animate, 1000 * this.state.deltaTime);
				this.state.startTimerLocked = false;
			}, startTime - new Date().getTime())

			for (const player of this.state.players.values()) {
				gameStarted = true;
				player.setTransform(startsLocationsGenerator());
				player.connectToWorld();
			}
		}
		this.isGameStarted = () => gameStarted;
		this.getMysteryLocations = () => mysteryLocations;
		this.playerDisconnected = (xid) => {
			const player = this.state.players.get(xid);
			player && player.disconnectFromWorld();
			this.state.players.delete(xid)
		}
		this.destroy = () => {
			clearInterval(intervalID);

			setTimeout(() => {

				while (this.state.world.bodies.length > 0) {
					let body = this.state.world.bodies.pop()!;
					this.state.world.removeBody(body);
				}
				try {

					this.state.scene.traverse((object) => {
						// @ts-ignore
						if (object.isMesh) {
							try {

								// @ts-ignore
								object.geometry.dispose();
							} catch { };

							try {
								// @ts-ignore
								object.material.dispose();
							} catch { };
						}
						// @ts-ignore
						if (object.material && object.material.map) {
							try {

								// @ts-ignore
								object.material.map.dispose(); // dispose texture map if exists
							} catch { };

						}
						this.state.scene.remove(object);
					});
				} catch { };

				// @ts-ignore
				this.state.scene = this.state.world = null;

			}, 10000 * this.state.deltaTime)
		}
	}
}
