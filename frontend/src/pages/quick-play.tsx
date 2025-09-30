import AssetLoader from "@/components/AssetLoader";
import { Play } from "@/components/Play";
import { ShaderScripts } from "@/components/ShaderScripts";
import { useRoom } from "@/hooks/useRoom";
import { AudioContainer } from "@/lib/AudioContainer";
import { CC, CS } from "@/shared/types/codes";
import { useAssetStore } from "@/store/useAssetLoader";
import { KartClient } from "@/types/KartClient";
import { KartRaceState } from "@schema/KartRaceState";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function quickPlay() {
    if (process.env.NODE_ENV === "production") {
        return <p></p>;
    }

    const Element = () => {
        const [client, setClient] = useState<KartClient>();
        const [startGameScreen, setStartGameScreen] = useState(false);
        const { progress } = useAssetStore();
        useEffect(() => {
            (async () => {
                const response = await colyseus.http.post<string>(
                    "rooms/kart_race",
                    {
                        body: {
                            roomName: "Local Dev",
                            mapId: 0,
                            password: "",
                        },
                    }
                );

                response.data;

                const client = await colyseus.joinById<KartRaceState>(
                    response.data,
                    {
                        playerName: "Dev",
                        password: "",
                    }
                );
                setClient(client);

                client.onMessage(CC.START_GAME, () => {
                    setStartGameScreen(true);
                });

                client.send(CS.READY, true);
            })();
        }, []);

        if (client === undefined) return <p> no client </p>;
        if (startGameScreen === false) return <p> no ready </p>;
        if (progress < 1) return <p>loading assets</p>;

        const map = new Map<number, [string, number, boolean]>();
        map.set(0, ["Local Dev", 0, true]);

        return (
            <>
                <Play
                    client={client}
                    goBack={() => {
                        document.location.reload();
                    }}
                    map={0}
                    pid={0}
                    players={map}
                />
            </>
        );
    };

    return (
        <>
            <header>
                <AssetLoader />
            </header>
            <AudioContainer />
            <Element />
            <ShaderScripts />
        </>
    );
}
