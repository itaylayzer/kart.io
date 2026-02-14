import { Socket } from "socket.io-client";
import { useStyles } from "../hooks/useStyles";
import { usePlayScreen } from "../viewmodels";
import { KartClient } from "@/types/KartClient";
import { Button } from "@/components/ui/button";

export function Play({
    client,
    players,
    pid,
    map,
    goBack,
    gameStartTime = 0,
}: {
    client: KartClient;
    map: number;
    pid: number;
    goBack: () => void;
    gameStartTime?: number;
    players: Map<number, [string, number, boolean]>;
}) {
    usePlayScreen(client, pid, players, map, goBack, gameStartTime);

    return (
        <>
            <div style={styles.gameContainer} className="gameContainer"></div>

            <p
                id="wrong"
                className="absolute top-5 left-1/2 -translate-x-1/2 m-0 z-10 bg-black/70 text-zinc-400 py-2 px-4 rounded text-sm"
                style={{ fontFamily: "var(--font-sans)" }}
            >
                YOU'RE FACING THE WRONG DIRECTION
            </p>
            <div
                id="position"
                className="absolute bottom-[10px] left-[10px] z-10 flex gap-2"
            >
                <div className="bg-black/60 py-1.5 px-3 rounded text-zinc-500 font-mono text-xs"></div>
                <div className="bg-black/60 py-1.5 px-3 rounded text-zinc-500 font-mono text-xs"></div>
            </div>
            <canvas
                id="map"
                width={500}
                height={500}
                className="absolute top-1/2 -translate-y-1/2 right-[10px] aspect-square w-[26.06vh] z-[3] pointer-events-none"
            />

            <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent rounded z-[12] invisible">
                <div className="flex flex-col items-center bg-black/85 rounded p-6">
                    <h3 className="scoreboard_finish text-lg font-medium text-zinc-400 mb-3">
                        Game Finished
                    </h3>
                    <table
                        id="scoreboard"
                        className="text-zinc-500 font-mono text-sm w-full border-separate [border-spacing:0.5rem_0.25rem]"
                    >
                        <tbody></tbody>
                    </table>
                    <Button
                        className="scoreboard_finish pointer-events-auto mt-4"
                        variant="outline"
                    >
                        Disconnect
                    </Button>
                </div>
            </main>

            <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                    id="pauseMenu"
                    className="bg-black/85 rounded p-6 z-[11]"
                    style={{ visibility: "hidden", pointerEvents: "none" }}
                >
                    <h5
                        className="text-lg font-medium text-zinc-400 text-center mb-1"
                        style={{ fontFamily: "var(--font-sans)" }}
                    >
                        Game Paused
                    </h5>
                    <p className="mb-4 text-center text-xs text-zinc-600 font-mono">
                        the server keeps playing
                    </p>
                    <div className="flex justify-center gap-2">
                        <Button variant="outline" id="resume" size="sm">
                            Resume
                        </Button>
                        <Button variant="outline" id="disconnect" size="sm">
                            Disconnect
                        </Button>
                    </div>
                </div>
            </main>

            <p
                id="velocity"
                className="absolute bottom-[10px] right-[10px] z-[3] bg-black/60 py-1.5 px-3 rounded font-mono text-xs text-zinc-500"
            >
                0.00 KM/S
            </p>

            <p
                id="timer"
                className="absolute top-[10px] right-[10px] z-[3] bg-black/60 py-1.5 px-3 rounded font-mono text-xs text-zinc-500"
            >
                00:00.000 s
            </p>

            <main
                id="start-timer"
                className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 invisible opacity-0 z-[20] flex items-center justify-center rounded bg-black/70 p-6"
            >
                <p
                    className="text-6xl font-medium text-zinc-300 text-center m-0"
                    style={{ fontFamily: "var(--font-sans)" }}
                ></p>
            </main>
        </>
    );
}

const styles = useStyles({
    gameContainer: {
        display: "block",
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
    },
});
