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
}: {
    client: KartClient;
    map: number;
    pid: number;
    goBack: () => void;

    players: Map<number, [string, number, boolean]>;
}) {
    usePlayScreen(client, pid, players, map, goBack);

    return (
        <>
            <div style={styles.gameContainer} className="gameContainer"></div>

            <p 
                id="wrong" 
                className="absolute top-5 left-1/2 -translate-x-1/2 bg-[#111] m-0 text-white py-[1.04vh] px-[2.08vh] rounded-lg text-[2.6vh] z-10"
                style={{ fontFamily: "New Super Mario Font U" }}
            >
                YOU'R FACING THE WRONG DIRECTION
            </p>
            <div
                id="position"
                className="absolute bottom-[10px] left-[10px] z-10 flex gap-[10px]"
            >
                <div className="bg-[#050505] py-[0.41vh] px-[1.66vh] rounded"></div>
                <div className="bg-[#050505] py-[0.41vh] px-[1.66vh] rounded"></div>
            </div>
            <canvas 
                id="map" 
                width={500} 
                height={500} 
                className="absolute top-1/2 -translate-y-1/2 right-[10px] aspect-square w-[26.06vh] z-[3] pointer-events-none"
            />

            <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent shadow-[0px_0px_10px_0px_rgba(0,0,0,0.5)] rounded-lg z-[12] invisible">
                <div className="flex flex-col items-center">
                    <h3 className="scoreboard_finish">Game Finished</h3>
                    <table id="scoreboard">
                        <tbody></tbody>
                    </table>
                    <Button
                        className="scoreboard_finish pointer-events-auto mb-[10px]"
                        variant="outline"
                    >
                        Disconnect
                    </Button>
                </div>
            </main>

            <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                    id="pauseMenu"
                    className="bg-[#090909] p-[2.08vh] rounded-lg shadow-[0px_0px_10px_0px_#090909] z-[11]"
                    style={{ visibility: "hidden", pointerEvents: "none" }}
                >
                    <h5 className="text-[4.17vh] font-light text-center mt-5 mb-1" style={{ fontFamily: "New Super Mario Font U" }}>
                        Game Paused
                    </h5>
                    <p className="mb-5 mt-0 text-center font-mono">but the server, keeps playing</p>
                    <div className="flex justify-center gap-2">
                        <Button variant="outline" id="resume">
                            Resume
                        </Button>
                        <Button variant="outline" id="disconnect">
                            Disconnect
                        </Button>
                    </div>
                </div>
            </main>

            <p 
                id="velocity" 
                className="absolute bottom-[10px] right-[10px] z-[3] bg-[#050505] py-[0.41vh] px-[1.66vh] rounded"
                style={{ fontFamily: "New Super Mario Font U" }}
            >
                0.00 KM/S
            </p>

            <p 
                id="timer" 
                className="absolute top-[10px] right-[10px] z-[3] bg-[#050505] py-[0.41vh] px-[1.66vh] rounded font-mono font-medium"
            >
                00:00.000 s
            </p>

            <main
                id="start-timer"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 rounded-full bg-black p-[3vh] aspect-square w-[70px] h-[70px] flex items-center justify-center"
            >
                <p className="text-[8vh] text-center m-0 font-mono"></p>
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
