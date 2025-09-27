import { useEffect, useState } from "react";
import { useToggle } from "../hooks/useToggle";
import { io, Socket } from "socket.io-client";
import { CC, CS } from "@shared/types/codes";
import { toast } from "react-toastify";
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
	const { playerName } = useSettingsStore();
	const [pid, setPID] = useState<number>(0);
	const isConnected = client !== undefined;
	const [map, setMap] = useState<number>(0);

	const goBack = () => {
		router.push('/');
	}

	useEffect(() => {
		console.error('useRoomScreen: start');

		let disconnect = () => { };
		// join server
		const playersMap = new Map<number, Player>();

		let password = "";
		if (room.hasPassword) {
			if (room.password === undefined) {
				password = prompt("Room password") ?? "";
			} else {
				password = room.password;
			}
		}
		global.colyseus.joinById<KartRaceState>(room.id, { password, playerName }).then((client) => {
			client.onError(() => {
				toast("Couldnt Connect", { type: "error" });
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

			$(client.state).players.onAdd(() => {

			});

			$(client.state).players.onRemove(({ color }) => {
				setPlayers((old) => {
					if (!old) return;
					old.delete(color);

					return new Map(old);
				})
			});

			$(client.state).players.onAdd(({ color, name, ready }) => {
				setPlayers((old) => {
					if (!old) return;
					old.set(color, [name, color, ready]);

					return new Map(old);
				})
			});
			$(client.state).players.onChange(({ color, name, ready }) => {
				setPlayers((old) => {
					if (!old) return;
					old.set(color, [name, color, ready]);

					return new Map(old);
				})
			})


			client.onMessage(CC.START_GAME, () => {
				setStartGameScreen(true);
			});

			disconnect = () => {
				console.error('useRoomScreen: disconnect');

				client.leave();
				setClient(undefined);
				setPlayers(undefined);
			};

		}).catch(() => {
			disconnect();
			console.error('useRoomScreen: catch');
		})

		window.onbeforeunload = window.onunload = () => {
			console.error('useRoomScreen: onbeforeunload');

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
		pid,
		socket: client,
		disconnect,
		map,
	};
};
