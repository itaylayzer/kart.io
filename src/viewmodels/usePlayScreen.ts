import { useEffect } from "react";
import game from "../game/game";
import useDestroy, { Action } from "../hooks/useDestroy";
import { useAssetStore } from "./useAssetLoader";

export const usePlayScreen = (room: number, name: string) => {
  const assets = useAssetStore();

  useEffect(() => {
    const destroyers: Action[] = [];

    const { destroyer } = game(assets, room, name);
    destroyers.push(destroyer);

    return useDestroy(destroyers);
  }, []);
};
