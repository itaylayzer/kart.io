import { useEffect, useState } from "react";
import { useToggle } from "../hooks/useToggle";
import { io, Socket } from "socket.io-client";
import { CC, CS } from "@shared/types/codes";
import { toast } from "sonner";
import { useSettingsStore } from "../store/useSettingsStore";
import Config from "@/config";
import { KartClient } from "@/types/KartClient";
import { KartRaceState } from '@schema/KartRaceState';
import { getStateCallbacks } from "colyseus.js";
import { StorageRoom } from "@/hooks/useRoom";
import { NextRouter } from "next/router";
type Player = [string, number, boolean];

export const useRoomScreen = (
	room: StorageRoom,
	router: NextRouter
) => {
	const [players, setPlayers] = useState<Map<number, Player>>();
	const [ready, toggleReady] = useToggle(false);
	const [client, setClient] = useState<KartClient>();
	const [startGameScreen, setStartGameScreen] = useState(false);
	const [gameStartTime, setGameStartTime] = useState<number>(0);
	const { playerName } = useSettingsStore();
	const [pid, setPID] = useState<number>(0);
	const isConnected = client !== undefined;
	const [map, setMap] = useState<number>(0);

	const goBack = () => {
		router.push('/');
	}

	useEffect(() => {
		console.warn('useRoomScreen: start');

		let disconnect = () => { };
		// join server
		const playersMap = new Map<number, Player>();

		const password = room.hasPassword ? (room.password ?? "") : "";
		const joinWithTimeout = Promise.race([
			global.colyseus.joinById<KartRaceState>(room.id, { password, playerName }),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("Connection timed out")), 15000)
			)
		]);

		joinWithTimeout.then((client) => {
			client.onError((code?: number, message?: string) => {
				const reason = message || (code !== undefined ? `Code ${code}` : "");
				toast.error(`Unable to connect${reason ? `: ${reason}` : ""}`);
				goBack();
			})

			setClient(client);
			const $ = getStateCallbacks(client);

			client.onStateChange.once((state) => {
				state.players;

				console.log("this is the first room state!", state);


				setMap(state.mapId);

				for (const { id, name, color, ready } of state.players.values()) {
					if (id === client.sessionId) {
						setPID(color);
					}

					playersMap.set(color, [name, color, ready]);
				}

				setPlayers(playersMap);
			});

			$(client.state).players.onRemove((player) => {
				const color = player?.color;
				if (color === undefined) return;
				setPlayers((old) => {
					if (!old) return;
					old.delete(color);

					return new Map(old);
				})
			});

			$(client.state).players.onAdd((player, key) => {
				if (!player) return;
				const { color, name, ready } = player;
				setPlayers((old) => {
					if (!old) return;
					old.set(color, [name, color, ready]);

					return new Map(old);
				})
			});
			$(client.state).players.onChange((player, key) => {
				if (!player) return;
				const { color, name, ready } = player;
				setPlayers((old) => {
					if (!old) return;
					old.set(color, [name, color, ready]);

					return new Map(old);
				})
			})


			client.onMessage(CC.START_GAME, (startTime?: number) => {
				// startTime from server avoids state sync race
				setGameStartTime(typeof startTime === "number" ? startTime : client.state.startTime || Date.now() + 5000);
				setStartGameScreen(true);
			});

			disconnect = () => {
				console.warn('useRoomScreen: disconnect');

				client.leave();
				setClient(undefined);
				setPlayers(undefined);
			};

		}).catch((err: unknown) => {
			disconnect();
			console.warn('useRoomScreen: catch', err);
			const reason = err instanceof Error ? err.message : (err && typeof err === "object" && "message" in err ? String((err as { message?: unknown }).message) : "");
			toast.error(`Unable to connect${reason ? `: ${reason}` : ""}`);
			goBack();
		})

		window.onbeforeunload = window.onunload = () => {
			console.warn('useRoomScreen: onbeforeunload');

			disconnect();
		};

		return () => {
			disconnect();
		};
	}, []);

	useEffect(() => {
		if (client === undefined) return;

		client.send(CS.READY, ready);
	}, [client, ready]);

	const disconnect = () => {
		client?.leave();
		setClient(undefined);
		setPlayers(undefined);
		goBack();
	};

	return {
		isConnected,
		players,
		toggleReady,
		ready,
		startGameScreen,
		gameStartTime,
		pid,
		socket: client,
		disconnect,
		map,
	};
};
