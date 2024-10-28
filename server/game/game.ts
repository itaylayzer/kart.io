import { Player } from "../player/Player";
import { GameState } from "./GameState";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import setup from "../api/setup";
import { useSockets } from "../hooks/useSockets";
import { CC } from "../store/codes";
import { GameTracker } from "./GameTracker";

export class Game {
	public state: GameState;

	public startGame: (time: number) => void;
	public isGameStarted: () => boolean;
	public getMysteryLocations: () => number[];
	public playerDisconnected: (xid: number) => void;

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


		this.state.world.gravity.set(0, 0, 0);
		let gameStarted = false;



		const animate = () => {
			this.state.elapsedTime += this.state.deltaTime;

			for (const p of this.state.players.values()) {
				p.update()
			}
			this.state.tracker.update();
			this.state.world.step(this.state.deltaTime);
		}


		this.startGame = (startTime) => {
			setTimeout(() => {
				setInterval(animate, 1000 * this.state.deltaTime);
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
	}
}
