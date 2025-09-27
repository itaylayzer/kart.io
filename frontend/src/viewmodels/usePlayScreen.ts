import { useEffect } from "react";
import game from "../game/game";
import useDestroy, { Action } from "../hooks/useDestroy";
import { useAssetStore } from "../store/useAssetLoader";
import { useSettingsStore } from "../store/useSettingsStore";
import { audio } from "../lib/AudioContainer";
import { KartClient } from "@/types/KartClient";

export const usePlayScreen = (
    client: KartClient,
    pid: number,
    players: Map<number, [string, number, boolean]>,
    map: number,
    goBack: () => void
) => {
    const assets = useAssetStore();
    const settings = useSettingsStore();
    useEffect(() => {
        const destroyers: Action[] = [];
        audio().play(
            ["Barriers", "Zane Little Music"],
            "/kart.io/audios/barriers.mp3"
        );
        const { destroyer } = game(assets, client, pid, players, settings, map, goBack);
        destroyers.push(destroyer);

        return useDestroy(destroyers);
    }, []);
};
