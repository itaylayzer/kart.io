import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getNameFromURL } from "../game/api/getNameFromURL";
import { useSettingsStore } from "../store/useSettingsStore";
import { audio } from "../lib/AudioContainer";

type Room = [number, string, number];

export const ip = "151.145.86.242";
export const port = 5350;
export const useIndexScreen = () => {
  const settingsStore = useSettingsStore();

  useEffect(() => {
    audio().play(
      ["Rhythm Factory", "Zane Little Music"],
      "./audios/rhythm_factory.mp3"
    );
    settingsStore.loadFromCookies(false);
  }, []);

  const [playerName, setPlayerName] = useState<string | undefined>(
    getNameFromURL()
  );

  const [screenIndex, setScreen] = useState<number>(
    playerName === undefined || playerName.length < 3 ? 0 : 1
  );
  const [rooms, setRooms] = useState<Room[] | Error | undefined>();
  const [roomName, setRoomName] = useState<string>("");
  const [room, setRoom] = useState<[number, string]>([0, "local"]);

  async function loadRooms() {
    setRooms(undefined);
    setRooms(
      await new Promise<Room[] | Error | undefined>(async (resolve) => {
        const timeout = setTimeout(() => {
          resolve(new Error("timeout"));
        }, 5000);

        try {
          const response = await fetch(`https://${ip}:${port}/list`);
          clearTimeout(timeout);
          resolve((await response.json()) as Room[]);
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
      const response = await fetch(
        `https://${ip}:${port}/register/${roomName}`
      );
      const value = await response.text();
      if (value.startsWith("p")) {
        setRoom([parseInt(value.substring(1)), roomName]);
        setScreen(5);
      } else {
        toast(["No More Ports to Open", "Server Error"][parseInt(value) - 1], {
          type: "error",
        });
        setScreen(1);
      }
    } catch {
      toast("Cannot Connect", {
        type: "error",
      });
      setScreen(1);
    }
  }

  useEffect(() => {
    if (screenIndex === 1) loadRooms();
  }, [screenIndex]);

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
  };
};
