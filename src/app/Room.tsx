import { Condition } from "../components/Condition";
import { COLORS } from "../game/player/Player";
import { useRoomScreen } from "../viewmodels/useRoomScreen";
import { Play } from "./Play";
import { GoDotFill } from "react-icons/go";
import { FidgetSpinner, RotatingSquare } from "react-loader-spinner";

export function Room({
  roomName,
  roomPort,
  goBack,
}: {
  roomPort: number;
  roomName: string;
  goBack: () => void;
}) {
  const {
    isConnected,
    players,
    toggleReady,
    ready,
    startGameScreen,
    pid,
    socket,
    disconnect,
  } = useRoomScreen(roomPort, goBack);
  return (
    <Condition
      conditions={startGameScreen}
      onTrue={<Play socket={socket!} players={players!} pid={pid} />}
      onFalse={
        <main style={{ display: "flex" }}>
          <Condition
            conditions={isConnected}
            onTrue={
              players === undefined ? (
                <RotatingSquare
                  visible={true}
                  height="100"
                  width="100"
                  color="#a22"
                  ariaLabel="rotating-square-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              ) : (
                <div style={{ display: "flex", gap: 50 }}>
                  <div
                    style={{
                      marginBlock: "auto",
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(150px, 1fr))",
                      gridAutoRows: "minmax(20px, auto)",
                      columnGap: 20,
                      maxHeight: 800,
                      width: 500,
                    }}
                  >
                    {Array.from(players.entries()).map(([id, p]) => (
                      <div
                        key={id}
                        className="player"
                        style={{
                          scale: `${0.9 + 0.1 * +p[2]}`,
                          opacity: 0.8 + 0.2 * +p[2],
                        }}
                      >
                        <div>
                          <GoDotFill
                            color={COLORS[p[1]]}
                            style={{ marginBlock: "auto" }}
                          />
                          <p> {p[0]}</p>{" "}
                          <GoDotFill
                            color={["white", "green"][+p[2]]}
                            style={{ marginBlock: "auto" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "block",
                      height: 300,
                      width: 5,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,25%)",
                    }}
                  ></div>
                  <div
                    style={{
                      display: "block",
                      marginBlock: "auto",
                    }}
                  >
                    <h1 style={{ fontSize: 80 }}>{roomName}</h1>

                    <br />
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="r" onClick={() => disconnect()}>Disconnect</button>
                      <button className="r" onClick={() => toggleReady()}>
                        {["Ready", "Unready"][+ready]}
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
            onFalse={
              <FidgetSpinner
                visible={true}
                height="80"
                width="80"
                ariaLabel="fidget-spinner-loading"
                wrapperStyle={{}}
                backgroundColor="#222"
                ballColors={["#f00", "#444", "#a22"]}
                wrapperClass="fidget-spinner-wrapper"
              />
            }
          />
        </main>
      }
    />
  );
}
