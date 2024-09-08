import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSettingsStore } from "../store/useSettingsStore";
import { audio } from "../lib/AudioContainer";

type Room = [number, string, number, boolean];

export const ip = "151.145.86.242";
export const port = 5350;
export const useIndexScreen = () => {
  const settingsStore = useSettingsStore();

  useEffect(() => {
    settingsStore.loadFromCookies(false);
  }, []);

  const { playerName, set } = settingsStore;
  const setPlayerName = (playerName: string) => set({ playerName });

  const [screenIndex, setScreen] = useState<number>(0);
  const [rooms, setRooms] = useState<Room[] | Error | undefined>();
  const [roomName, setRoomName] = useState<string>("");
  const [roomPassword, setRoomPassword] = useState<string>("");
  const [room, setRoom] = useState<
    [number, string, boolean, string | undefined]
  >([0, "local", false, undefined]);

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
        [
          `https://${ip}:${port}/register/${roomName}`,
          `https://${ip}:${port}/registerpass/${roomName}/${roomPassword}`,
        ][+(roomPassword.length > 0)]
      );
      const value = await response.text();
      if (value.startsWith("p")) {
        setRoom([
          parseInt(value.substring(1)),
          roomName,
          roomPassword.length > 0,
          roomPassword,
        ]);
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
    if (screenIndex === 1) {
      loadRooms();
      audio().play(
        ["Rhythm Factory", "Zane Little Music"],
        "./audios/rhythm_factory.mp3"
      );
    }
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
    setRoomPassword,
  };
};
