import { createRef, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSettingsStore } from "../store/useSettingsStore";
import { audio } from "../lib/AudioContainer";
import { CatmullRomCurve3 } from "three";
import { curvePoints } from "@shared/config/road";
import { createVectorsFromNumbers } from "../game/api/setup/road";
import { renderMap } from "../game/player/WorldMap";
import Config from "@/config";
import { RoomData } from "@/types/room";

export const ip = Config.BASE_URL!;
export const ip_path = Config.PATH ?? "";

export const useIndexScreen = () => {
	const settingsStore = useSettingsStore();

	useEffect(() => {
		settingsStore.loadFromCookies(false);
	}, []);

	const { playerName, set } = settingsStore;
	const setPlayerName = (playerName: string) => set({ playerName });

	const [screenIndex, setScreen] = useState<number>(0);
	const [rooms, setRooms] = useState<RoomData[] | Error | undefined>();
	const [roomName, setRoomName] = useState<string>("");
	const [roomPassword, setRoomPassword] = useState<string>("");
	const [roomMap, setRoomMap] = useState<number>(0);
	const [room, setRoom] = useState<
		[string, string, boolean, string | undefined]
	>(["", "local", false, undefined]);

	const roomMapCanvasRef = createRef<HTMLCanvasElement>();

	async function loadRooms() {
		setRooms(undefined);
		setRooms(
			await new Promise<RoomData[] | Error | undefined>(async (resolve) => {
				const timeout = setTimeout(() => {
					resolve(new Error("timeout"));
				}, 5000);

				try {

					const availableRooms = (await global.colyseus.http.get('rooms/kart_race')).data;
					clearTimeout(timeout);
					resolve(availableRooms as RoomData[]);
				} catch (er) {
					toast("Cannot Connect", {
						type: "error",
					});
					clearTimeout(timeout);

					resolve(er as Error);
				}
			})
		);
	}

	async function createRoom() {
		try {
			const response = await colyseus.http.post<string>('rooms/kart_race', {
				body: {
					roomName: roomName,
					mapId: roomMap,
					password: roomPassword
				}
			});

			setRoom([
				response.data,
				roomName,
				roomPassword.length > 0,
				roomPassword,
			]);
			setScreen(5);


		} catch (err) {
			toast("Cannot Connect", {
				type: "error",
			});
			setScreen(1);
		}
	}

	useEffect(() => {
		if (screenIndex === 1) {
			loadRooms();
			audio().play(
				["Rhythm Factory", "Zane Little Music"],
				"/kart.io/audios/rhythm_factory.mp3"
			);
		}
	}, [screenIndex]);

	useEffect(() => {
		if (roomMapCanvasRef.current === null) return;
		renderMap(
			new CatmullRomCurve3(
				createVectorsFromNumbers(curvePoints[roomMap])
			),
			roomMapCanvasRef.current!,
			500
		);
	}, [roomMapCanvasRef.current, roomMap, screenIndex]);

	return {
		room,
		playerName,
		setPlayerName,
		screenIndex,
		setScreen,
		loadRooms,
		rooms,
		createRoom,
		setRoomName,
		setRoom,
		setRoomPassword,
		roomMap,
		setRoomMap,
		roomMapCanvasRef,
		roomName,
		roomPassword,
	};
};
