import { useEffect } from "react";
import game from "../game/game";
import useDestroy, { Action } from "../hooks/useDestroy";
import { useAssetStore } from "./useAssetLoader";
import { Socket } from "socket.io-client";

export const usePlayScreen = (socket: Socket, pid:number, players:Map<number, [string,string,boolean]>) => {
  const assets = useAssetStore();

  useEffect(() => {
    const destroyers: Action[] = [];

    const { destroyer } = game(assets, socket, pid, players);
    destroyers.push(destroyer);

    return useDestroy(destroyers);
  }, []);
};
