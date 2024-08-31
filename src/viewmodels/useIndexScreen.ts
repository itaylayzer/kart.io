import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getNameFromURL } from "../game/api/getNameFromURL";

type Room = [number, string, number];

const ip = "localhost"; //'151.145.86.242';

export const useIndexScreen = () => {
  const [playerName, setPlayerName] = useState<string | undefined>(
    getNameFromURL()
  );
  const [screenIndex, setScreen] = useState<number>(
    playerName === undefined || playerName.length < 3 ? 0 : 1
  );
  const [rooms, setRooms] = useState<Room[] | Error | undefined>();
  const [roomName, setRoomName] = useState<string>("");
  const [room, setRoom] = useState<number>(3001);
  async function loadRooms() {
    setRooms(undefined);
    try {
      const response = await fetch(`http://${ip}:3000/list`);
      setRooms((await response.json()) as Room[]);
    } catch (er) {
      setRooms(er as Error);
    }
  }

  async function createRoom() {
    const response = await fetch(`http://${ip}:3000/register/${roomName}`);
    const value = await response.text();
    if (value.startsWith("p")) {
      toast(value);
      setRoom(parseInt(value.substring(1)));
      setScreen(4);
    } else {
      toast(["No More Ports to Open", "Server Error"][parseInt(value) - 1]);
      setScreen(2);
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
