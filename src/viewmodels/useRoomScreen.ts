import { useEffect, useState } from "react";
import { useToggle } from "../hooks/useToggle";
import { io, Socket } from "socket.io-client";
import { CC, CS } from "@/server/store/codes";
import { toast } from "react-toastify";
import { useSettingsStore } from "../store/useSettingsStore";
import { ip, ip_path } from "./useIndexScreen";

type Player = [string, number, boolean];

export const useRoomScreen = (
	room: string,
	goBack: () => void,
	needPassword: boolean,
	tryPassword: string | undefined
) => {
	const [players, setPlayers] = useState<Map<number, Player>>();
	const [ready, toggleReady] = useToggle(false);
	const [socket, setSocket] = useState<Socket>();
	const [startGameScreen, setStartGameScreen] = useState(false);
	const { playerName } = useSettingsStore();
	const [pid, setPID] = useState<number>(0);
	const isConnected = socket !== undefined;
	const [map, setMap] = useState<number>(0);
	useEffect(() => {
		// join server
		const playersMap = new Map<number, Player>();

		let password = "";
		if (needPassword) {
			if (tryPassword === undefined) {
				password = prompt("Room password") ?? "";
			} else {
				password = tryPassword;
			}
		}
		const socket = io(`wss://${ip}${ip_path}/room/${room}`, {
			path: `${ip_path}/socket.io`,
			transports: ["websocket"],
			query: [undefined, { password }][+needPassword],
		});

		socket.on("connect", () => {
			setSocket(socket);
			socket.emit(CS.JOIN, playerName);
		});
		socket.on("error", () => {
			toast("Couldnt Connect", { type: "error" });
			goBack();
		});
		socket.on(
			CC.INIT,
			(
				data:
					| false
					| true
					| [number, number, number, [number, ...Player][]]
			) => {
				if (data === false) {
					toast("Game Started", { type: "error" });
					goBack();
					return;
				}

				if (typeof data === "boolean") {
					toast("Password Incorrect", { type: "error" });
					goBack();
					return;
				}

				const [selfId, mapIndex, selfColor, players] = data;
				setMap(mapIndex);
				setPID(selfId);
				playersMap.set(selfId, [playerName, selfColor, false]);

				for (const [pid, pname, pcolor, pready] of players) {
					playersMap.set(pid, [pname, pcolor, pready]);
				}

				setPlayers(playersMap);
			}
		);

		socket.on(
			CC.NEW_PLAYER,
			([pid, name, color]: [number, string, number]) => {
				playersMap.set(pid, [name, color, false]);

				setPlayers(new Map(playersMap));
			}
		);

		socket.on(CC.START_GAME, () => {
			setStartGameScreen(true);
		});

		socket.on(CC.READY, ([id, ready]: [number, boolean]) => {
			playersMap.get(id)![2] = ready;
			setPlayers(new Map(playersMap));
		});

		socket.on(CC.DISCONNECTED, (disconnectedID: number) => {
			playersMap.delete(disconnectedID);
			setPlayers(new Map(playersMap));
		});
		const disconnect = () => {
			socket.disconnect();
			setSocket(undefined);
			setPlayers(undefined);
		};

		window.onbeforeunload = window.onunload = () => {
			disconnect();
		};

		return () => {
			disconnect();
		};
	}, []);

	useEffect(() => {
		if (socket === undefined) return;

		socket.emit(CS.READY, ready);
	}, [socket, ready]);

	const disconnect = () => {
		socket?.disconnect();
		setSocket(undefined);
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
		socket,
		disconnect,
		map,
	};
};
