import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "../store/useSettingsStore";
import { audio } from "../lib/AudioContainer";
import Config from "@/config";
import { RoomData } from "@/types/room";


export const useIndexScreen = () => {
	const settingsStore = useSettingsStore();

	useEffect(() => {
		settingsStore.loadFromCookies(false);
	}, []);


	const [screenIndex, setScreen] = useState<number>(1); // Start at Menu (1)
	const [rooms, setRooms] = useState<RoomData[] | Error | undefined>();


	const { playerName, set } = settingsStore;
	// Initialize with random Guest name immediately to avoid hydration mismatch if possible, 
	// but random needs to be consistent. 
	// Proper way: empty/Guest, then effect sets random if needed.
	// Or just "Guest" + Math.random().
	const [currentPlayerName, setCurrentPlayerName] = useState<string>("Guest");

	useEffect(() => {
		if (typeof window !== 'undefined' && currentPlayerName === "Guest") {
			setCurrentPlayerName(`Guest${Math.floor(Math.random() * 1000)}`);
		}
	}, []);

	const confirmPlayerName = () => {
		set({ playerName: currentPlayerName });
	}

	// Memoize to be safe, though not strictly needed if not used in dependency arrays of parent
	const setPlayerName = useCallback((name: string) => setCurrentPlayerName(name), []);


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
					toast.error("Cannot Connect");
					clearTimeout(timeout);

					resolve(er as Error);
				}
			})
		);
	}

	async function quickPlay(setRoom: (id: string, name: string, hasPassword: boolean, password?: string) => void, router: { push: (path: string) => void }) {
		try {
			const { data: rooms } = await global.colyseus.http.get<RoomData[]>('rooms/kart_race');
			const eligible = (Array.isArray(rooms) ? rooms : [])
				.filter(r => !r.locked && r.metadata?.visible !== false && !r.metadata?.hasPassword)
				.sort((a, b) => (b.clients ?? 0) - (a.clients ?? 0));
			if (eligible.length === 0) {
				toast.error("No rooms available");
				return;
			}
			const room = eligible[Math.floor(Math.random() * Math.min(eligible.length, 3))];
			setRoom(room.roomId, room.metadata?.roomName ?? "Quick Play", false, undefined);
			router.push(`/play/${room.roomId}/`);
		} catch {
			toast.error("Cannot Connect");
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
		onPlayButton,
		quickPlay
	};
};
