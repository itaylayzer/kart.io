import { ToastContainer } from "react-toastify";
import { Listed } from "../components/Listed";
import { ip, port, useIndexScreen } from "../viewmodels/useIndexScreen";
import { Room } from "./Room";
import AssetLoader from "../components/AssetLoader";
import { FidgetSpinner } from "react-loader-spinner";
import { BiErrorAlt } from "react-icons/bi";
import { Settings } from "./Settings";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { AudioContainer } from "../lib/AudioContainer";
import { Button, TextField } from "@mui/material";

export function Index() {
  const {
    createRoom,
    setRoomName,
    loadRooms,
    rooms,
    screenIndex,
    setScreen,
    room,
    setRoom,
    playerName,
    setPlayerName,
  } = useIndexScreen();

  return (
    <>
      <footer></footer>
      <header>
        {" "}
        <AssetLoader
          items={{
            car: "fbx/kart.glb",
            mystery: "textures/mystery.png",
            block: "textures/blocks2.png",
            sfx_slow: "sfx/engine_heavy_slow_loop.mp3",
            sfx_fast: "sfx/engine_heavy_fast_loop.mp3",
            sfx_avg: "sfx/engine_heavy_average_loop.mp3",
          }}
        >
          <></>{" "}
        </AssetLoader>
      </header>

      <Tooltip
        id="t"
        style={{
          backgroundColor: "#020202",
          zIndex: 3,
          fontFamily: "monospace",
          color: "white",
          opacity: 1,
          fontWeight: 400,
        }}
      />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnHover
        pauseOnFocusLoss={false}
        closeButton={false}
        theme="dark"
      />
      <AudioContainer />
      <Listed
        index={screenIndex}
        childrens={[
          <main>
            <table className="instructions">
              <tr>
                {" "}
                <th>keyboard key</th> <th>gamepad key</th> <th>action</th>{" "}
              </tr>
              <tr>
                {" "}
                <td> W / S </td> <td>A / B / 0 / 1 </td> <td>Accelerating </td>{" "}
              </tr>
              <tr>
                {" "}
                <td> A / D </td>{" "}
                <td>Right Axis X Axis / Npad Right / Npad Left </td>
                <td>Sterring Wheel </td>{" "}
              </tr>
              <tr>
                {" "}
                <td> Space </td> <td>R1 </td> <td>Drift </td>{" "}
              </tr>
              <tr>
                {" "}
                <td> Mouse Right </td> <td>L1 </td> <td>Show Scoreboard </td>{" "}
              </tr>
              <tr>
                {" "}
                <td> Mouse Left </td> <td>X / Y / 2 / 3 / L2 / R2 </td>{" "}
                <td>Use Special </td>{" "}
              </tr>
              <tr>
                {" "}
                <td> Escape </td> <td>Start </td> <td>Unlock / Pause Menu </td>{" "}
              </tr>
            </table>
            <br />
            <center
              style={{ display: "flex", gap: 10, justifyContent: "center" }}
            >
              <Button
                data-tooltip-id="t"
                data-tooltip-content={
                  "you need to visit this page to allow your browser reach the servers"
                }
                onClick={() => window.open(`https://${ip}:${port}`, "_blank")}
                className="r mini"
              >
                Servers Page
              </Button>
              <TextField
                data-tooltip-id="t"
                data-tooltip-content={"Player Name"}
                variant="outlined"
                placeholder="Enter Player Name"
                value={playerName}
                onChange={(a) => setPlayerName(a.currentTarget.value)}
              />
            </center>
            <br />
            <br />
            <center>
              <Button
                className="r"
                onClick={() => {
                  setScreen(1);
                }}
              >
                Play
              </Button>
            </center>
          </main>,
          <main style={{ display: "flex" }}>
            <div
              style={{
                display: "block",
                marginBlock: "auto",
              }}
            >
              <center>
                <h1 style={{ fontSize: 50 }}>Servers</h1>

                {Array.isArray(rooms) ? (
                  <>
                    <p
                      style={{
                        fontSize: 25,
                        opacity: 0.3,
                      }}
                    >
                      {rooms.length === 0 ? "No Rooms Founded" : ""}
                    </p>
                    <div
                      style={{
                        display: "block",
                        maxHeight: (500 * 4) / 6,
                        width: 550,
                        overflowY: "scroll",
                        overflowX: "hidden",
                      }}
                    >
                      <center>
                        {rooms
                          // @ts-ignore
                          .toSorted((a, b) => a[1].localeCompare(b[1]))
                          // @ts-ignore

                          .map((r) => (
                            <div
                              className="room"
                              onClick={() => {
                                setRoom([r[0], r[1]]);
                                setScreen(5);
                              }}
                            >
                              <table>
                                <tr>
                                  <th>port</th>
                                  <th>name</th>
                                  <th>players count</th>
                                </tr>
                                <tr>
                                  <td>{r[0]}</td>
                                  <td>{r[1]}</td>
                                  <td>{r[2]}</td>
                                </tr>
                              </table>
                            </div>
                          ))}{" "}
                      </center>
                    </div>
                  </>
                ) : rooms === undefined ? (
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
                ) : (
                  <BiErrorAlt color="#a22" size={80} />
                )}
              </center>
            </div>
            <div
              style={{
                display: "block",
                marginBlock: "auto",
              }}
            >
              <h1
                style={{
                  flexGrow: 1,
                  minWidth: "20ch",
                  width: "100%",
                  fontSize: 60,
                  marginBottom: 0,
                }}
              >
                Kart.IO{" "}
              </h1>
              <h6
                style={{ marginTop: 0, marginBottom: 40 }}
                onClick={() => {
                  window.open("https://itaylayzer.github.io");
                }}
                onAuxClick={() => {
                  window.open("https://itaylayzer.github.io", "_blank");
                }}
              >
                © 2024 itaylayzer
              </h6>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 5,
                  minWidth: "100%",
                }}
              >
                <button
                  data-tooltip-id="t"
                  data-tooltip-content={"Reload Rooms"}
                  className="r mini"
                  onClick={() => loadRooms()}
                >
                  reload
                </button>
                <button
                  data-tooltip-id="t"
                  data-tooltip-content={"Create Room"}
                  className="r mini"
                  onClick={() => setScreen(2)}
                >
                  create
                </button>
                <button
                  data-tooltip-id="t"
                  data-tooltip-content={"Credits Page"}
                  className="r mini"
                  onClick={() => setScreen(3)}
                >
                  credits
                </button>
                <button
                  data-tooltip-id="t"
                  data-tooltip-content={"Settings Page"}
                  className="r mini"
                  onClick={() => setScreen(4)}
                >
                  settings
                </button>
              </div>
            </div>
          </main>,
          <main>
            <h1>Create Room</h1>
            <input
              style={{ marginBottom: 10, width: "100%" }}
              type="text"
              placeholder="Room's Name"
              onChange={(e) => setRoomName(e.currentTarget.value)}
            />
            <br />
            <input
              style={{ width: "100%" }}
              type="password"
              placeholder="Room's Password"
            />
            <br />
            <center>
              {" "}
              <br />
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <button
                  className="r"
                  onClick={() => {
                    setScreen(1);
                  }}
                >
                  cancel
                </button>
                <button
                  className="r"
                  onClick={() => {
                    createRoom();
                  }}
                >
                  create room
                </button>
              </div>
            </center>
          </main>,
          <main>
            <h1 style={{ fontSize: 60, marginBottom: 0 }}>credits</h1>
            <center>
              {" "}
              <p
                style={{
                  marginTop: 0,
                  marginBottom: 20,
                  fontFamily: "monospace",
                  fontWeight: 300,
                }}
              >
                without your creations, this game wasn't been made
              </p>
            </center>
            <div
              style={{ display: "block", maxHeight: 300, overflowY: "scroll" }}
            >
              {" "}
              <h3> road </h3>
              <p>
                {" "}
                https://hofk.de/main/discourse.threejs/2021/CarRacing/CarRacing.html
              </p>
              <h3> motion blur </h3>
              <p>https://www.clicktorelease.com/tmp/threejs/mblur/</p>
              <h3> sketchfab </h3>
              <p>
                {" "}
                @Gyro - Kart <br />
                https://sketchfab.com/3d-models/kart-cf740a3e6ba2430497c2b0e15f93c5eb#download{" "}
              </p>
              <h3> textures </h3>
              <p>
                {" "}
                txt_road =
                https://hofk.de/main/discourse.threejs/2021/CarRacing/CentralMarking.png{" "}
              </p>
              <h3> fonts </h3>
              <p> Signika - @google-fonts </p>
              <p>
                {" "}
                New Super Mario Font U -
                https://www.cdnfonts.com/new-super-mario-font-u.font{" "}
              </p>
              <h3>Music by Zane Little Music</h3>
              <p> barriers - https://opengameart.org/content/barriers</p>
              <p>
                {" "}
                rhythm factory - https://opengameart.org/content/rhythm-factory
              </p>
              <p> apple cider - https://opengameart.org/content/apple-cider</p>
            </div>
            <br />
            <center>
              {" "}
              <button
                className="r"
                onClick={() => {
                  setScreen(1);
                }}
              >
                back
              </button>
            </center>
          </main>,
          <Settings
            goBack={() => {
              setScreen(1);
            }}
          ></Settings>,
          <Room
            roomPort={room[0]}
            roomName={room[1]}
            goBack={() => {
              setScreen(1);
            }}
          />,
        ]}
      ></Listed>
    </>
  );
}
