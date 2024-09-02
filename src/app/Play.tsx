import { Socket } from "socket.io-client";
import { useStyles } from "../hooks/useStyles";
import { usePlayScreen } from "../viewmodels";

export function Play({
  socket,
  players,
  pid,
}: {
  socket: Socket;

  pid: number;
  players: Map<number, [string, number, boolean]>;
}) {
  usePlayScreen(socket, pid, players);

  return (
    <>
      <div style={styles.gameContainer} className="gameContainer"></div>

      <p id="wrong" style={styles.wrong}>
        YOU'R FACING THE WRONG DIRECTION
      </p>
      <div
        id="position"
        style={{ bottom: 10, zIndex: 10, position: "absolute", gap: 10 }}
      >
        <div style={styles.position}></div> <div style={styles.position}></div>
      </div>
      <canvas id="map" width={500} height={500} style={styles.map} />

      <main>
        <table id="scoreboard" style={{ zIndex: 11 }}></table>
      </main>

      <main>
        <div id="pauseMenu">
          <h5>Game Paused</h5>
          <p>but the server, keeps playing</p>
          <button className="r" id="resume">Resume</button>
          <button className="r" id="disconnect">Disconnect</button>
        </div>
      </main>

      <p id="velocity" style={styles.velocity}>
        0.00 KM/S
      </p>
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
    paddingBlock: 4,
    paddingInline: 16,
    borderRadius: 4,
  },
  map: {
    position: "absolute",
    top: "50%",
    translate: "0% -50%",
    right: 10,
    aspectRatio: 1,
    width: 250,
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
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: 25,
  },
  velocity: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 3,
    backgroundColor: "#050505",
    paddingBlock: 4,
    paddingInline: 16,
    borderRadius: 4,
    fontFamily: "New Super Mario Font U",
  },
});
