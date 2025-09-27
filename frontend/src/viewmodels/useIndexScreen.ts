import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSettingsStore } from "../store/useSettingsStore";
import { audio } from "../lib/AudioContainer";
import Config from "@/config";
import { RoomData } from "@/types/room";


export const useIndexScreen = () => {
	const settingsStore = useSettingsStore();

	useEffect(() => {
		settingsStore.loadFromCookies(false);
	}, []);


	const [screenIndex, setScreen] = useState<number>(0);
	const [rooms, setRooms] = useState<RoomData[] | Error | undefined>();


	const { playerName, set } = settingsStore;
	const [currentPlayerName, setCurrentPlayerName] = useState<string>("Guest");

	const confirmPlayerName = () => {
		set({ playerName: currentPlayerName });
	}
	const setPlayerName = (playerName: string) => setCurrentPlayerName(playerName);


	useEffect(() => {
		if (playerName !== 'Guest' && screenIndex === 0) setScreen(1);
	}, [playerName, screenIndex])


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

	useEffect(() => {
		if (screenIndex === 1) {
			loadRooms();
			audio().play(
				["Rhythm Factory", "Zane Little Music"],
				"/kart.io/audios/rhythm_factory.mp3"
			);
		}
	}, [screenIndex]);


	const onPlayButton = () => {
		setScreen(1);
		confirmPlayerName();
	}

	return {
		playerName: currentPlayerName,
		setPlayerName,
		screenIndex,
		loadRooms,
		rooms,
		onPlayButton
	};
};
