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
  players: Map<number, [string, string, boolean]>;
}) {
  usePlayScreen(socket, pid, players);

  return (
    <>
      <div style={styles.gameContainer} className="gameContainer"></div>

      <p id="wrong" style={styles.wrong}>
        YOU'R FACING THE WRONG DIRECTION
      </p>
      <p id="position" style={styles.position}>
        0
      </p>
      <canvas id="map" width={500} height={500} style={styles.map} />
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
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "#050505",
    margin: 0,
    color: "white",
    fontFamily: "New Super Mario Font U",
    padding: "4px 16px",
    borderRadius: "4px",
    fontSize: 20,
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
});
