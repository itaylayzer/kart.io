import { useEffect } from "react";
import game from "../game/game";
import useDestroy, { Action } from "../hooks/useDestroy";
import { useAssetStore } from "../store/useAssetLoader";
import { Socket } from "socket.io-client";
import { useSettingsStore } from "../store/useSettingsStore";

export const usePlayScreen = (
  socket: Socket,
  pid: number,
  players: Map<number, [string, string, boolean]>
) => {
  const assets = useAssetStore();
  const settings = useSettingsStore();
  useEffect(() => {
    const destroyers: Action[] = [];

    const { destroyer } = game(assets, socket, pid, players, settings);
    destroyers.push(destroyer);

    return useDestroy(destroyers);
  }, []);
};
