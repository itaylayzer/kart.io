import { Socket } from "socket.io-client";
import { useStyles } from "../hooks/useStyles";
import { usePlayScreen } from "../viewmodels";

export function Play({
    socket,
    players,
    pid,
    map,
    goBack,
}: {
    socket: Socket;
    map: number;
    pid: number;
    goBack: () => void;

    players: Map<number, [string, number, boolean]>;
}) {
    usePlayScreen(socket, pid, players, map, goBack);

    return (
        <>
            <div style={styles.gameContainer} className="gameContainer"></div>

            <p id="wrong" style={styles.wrong}>
                YOU'R FACING THE WRONG DIRECTION
            </p>
            <div
                id="position"
                style={{
                    bottom: 10,
                    zIndex: 10,
                    position: "absolute",
                    gap: 10,
                }}
            >
                <div style={styles.position}></div>
                <div style={styles.position}></div>
            </div>
            <canvas id="map" width={500} height={500} style={styles.map} />

            <main
                style={{
                    backgroundColor: "rgba(8,8,8, 100%)",
                    boxShadow: `0px 0px 10px 0px rgba(0, 0, 0, 50%)`,
                    borderRadius: 10,
                    zIndex: 12,
                }}
            >
                <center>
                    <h3 className="scoreboard_finish">Game Finished</h3>
                    <table id="scoreboard">
                        <tbody></tbody>
                    </table>
                    <button
                        style={{
                            pointerEvents: "all",
                            marginBottom: 10,
                        }}
                        className="r scoreboard_finish"
                    >
                        Disconnect
                    </button>
                </center>
            </main>

            <main>
                <div id="pauseMenu">
                    <h5>Game Paused</h5>
                    <p>but the server, keeps playing</p>
                    <center>
                        <button className="r" id="resume">
                            Resume
                        </button>
                        <button className="r" id="disconnect">
                            Disconnect
                        </button>
                    </center>
                </div>
            </main>

            <p id="velocity" style={styles.velocity}>
                0.00 KM/S
            </p>

            <p id="timer" style={styles.timer}>
                00:00.000 s
            </p>

            <main
                id="start-timer"
                style={{
                    opacity: "0",
                    borderRadius: "100%",
                    backgroundColor: "black",
                    padding: "3vh",
                    aspectRatio: "1",
                    width: 70,
                    height: 70,
                }}
            >
                <p
                    style={{
                        fontSize: "8vh",
                        textAlign: "center",
                        margin: "0",
                        marginBlock: "auto",
                        fontFamily: "monospace",
                    }}
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

    position: {
        backgroundColor: "#050505",
        paddingBlock: "0.41vh",
        paddingInline: "1.66vh",
        borderRadius: 4,
    },
    map: {
        position: "absolute",
        top: "50%",
        translate: "0% -50%",
        right: 10,
        aspectRatio: 1,
        width: "26.06vh",
        zIndex: 3,
        pointerEvents: "none",
    },
    wrong: {
        position: "absolute",
        top: 20,
        left: "50%",
        translate: "-50% 0%",
        backgroundColor: "#111",
        margin: 0,
        color: "white",
        fontFamily: "New Super Mario Font U",
        padding: "1.04vh 2.08vh",
        borderRadius: "8px",
        fontSize: "2.6vh",
    },
    velocity: {
        position: "absolute",
        bottom: 10,
        right: 10,
        zIndex: 3,
        backgroundColor: "#050505",
        paddingBlock: "0.41vh",
        paddingInline: "1.66vh",
        borderRadius: 4,
        fontFamily: "New Super Mario Font U",
    },
    timer: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 3,
        backgroundColor: "#050505",
        paddingBlock: "0.41vh",
        paddingInline: "1.66vh",
        borderRadius: 4,
        fontFamily: "monospace",
        fontWeight: 500,
    },
});
