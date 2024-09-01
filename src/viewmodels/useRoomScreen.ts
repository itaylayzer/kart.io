import { useEffect, useState } from "react";
import { getNameFromURL } from "../game/api/getNameFromURL";
import { useToggle } from "../hooks/useToggle";
import { io, Socket } from "socket.io-client";
import { CC, CS } from "@/server/store/codes";
import { toast } from "react-toastify";

type Player = [string, string, boolean];

export const useRoomScreen = (room: number, goBack: () => void) => {
  const [players, setPlayers] = useState<Map<number, Player>>();
  const [ready, toggleReady] = useToggle(false);
  const [socket, setSocket] = useState<Socket>();
  const [startGameScreen, setStartGameScreen] = useState(false);
  const [pid, setPID] = useState<number>(0);
  const isConnected = socket !== undefined;

  useEffect(() => {
    // join server
    const playersMap = new Map<number, Player>();
    const socket = io(`http://127.0.0.1:${room}`, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setSocket(socket);
      socket.emit(CS.JOIN, getNameFromURL());
    });
    socket.on("error", () => {
      toast("Couldnt Connect", { type: "error" });
      goBack();
    });
    socket.on(
      CC.INIT,
      (data: false | [number, string, [number, ...Player][]]) => {
        if (data === false) {
          toast("Game Started", { type: "error" });
          goBack();
          return;
        }

        const [selfId, selfColor, players] = data;
        setPID(selfId);
        playersMap.set(selfId, [getNameFromURL(), selfColor, false]);

        for (const [pid, pname, pcolor, pready] of players) {
          playersMap.set(pid, [pname, pcolor, pready]);
        }

        setPlayers(playersMap);
      }
    );

    socket.on(CC.NEW_PLAYER, ([pid, name, color]: [number, string, string]) => {
      playersMap.set(pid, [name, color, false]);

      setPlayers(new Map(playersMap));
    });

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
  };
};
