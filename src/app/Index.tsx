import { ToastContainer } from "react-toastify";
import { Listed } from "../components/Listed";
import { ip, port, useIndexScreen } from "../viewmodels/useIndexScreen";
import { Condition } from "../components/Condition";
import { Room } from "./Room";
import AssetLoader from "../components/AssetLoader";
import { FidgetSpinner } from "react-loader-spinner";
import { BiErrorAlt } from "react-icons/bi";
import { Settings } from "./Settings";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";

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
  } = useIndexScreen();
  return (
    <>
      <Condition
        conditions={screenIndex < 4}
        onTrue={
          <>
            <div className="blocks header" />
            <div className="blocks footer" />
            <footer></footer>
            <header>
              {" "}
              <AssetLoader
                items={{
                  car: "fbx/kart.glb",
                  // sfx_throw:"https://soxundbible.com/mp3/kung_fu_punch-Mike_Koenig-2097967259.mp3"
                  txt_circle: "textures/circle.png",
                  txt_road: "textures/CentralMarking.png",
                  mystery: "textures/mystery.png",
                  block: "textures/blocks2.png",
                }}
              >
                <></>{" "}
              </AssetLoader>
            </header>
          </>
        }
      />
      <Tooltip
        id="t"
        style={{
          backgroundColor: "#020202",
          zIndex: 3,
          fontFamily: "monospace",
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
        closeButton={false}
        theme="dark"
      />
      <Listed
        index={screenIndex}
        childrens={[
          <main>
            <h2>welcome to</h2> <h1>Kart.IO</h1>
            <p>
              to play this game you need 2 things
              <br />
              First go into this website, and make your browser accepts this
              domain:{" "}
              <a href={`https://${ip}:${port}`}>
                {ip}:{port}
              </a>{" "}
              <br />
              Edit this url, and add the string '?name=' and after that your
              username at the end. for example /kart.io/?name=MyName
            </p>
          </main>,
          <main style={{ display: "flex" }}>
            <div
              style={{
                display: "block",
                marginBlock: "auto",
              }}
            >
              <center>
                <h1
                  style={{ fontSize: 50, fontFamily: "New Super Mario Font U" }}
                >
                  Servers
                </h1>

                {Array.isArray(rooms) ? (
                  <>
                    <p
                      style={{
                        fontFamily: "New Super Mario Font U",
                        fontSize: 25,
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
                  className="mini"
                  onClick={() => loadRooms()}
                >
                  reload
                </button>
                <button
                  data-tooltip-id="t"
                  data-tooltip-content={"Create Room"}
                  className="mini"
                  onClick={() => setScreen(2)}
                >
                  create
                </button>
                <button
                  data-tooltip-id="t"
                  data-tooltip-content={"Credits Page"}
                  className="mini"
                  onClick={() => setScreen(3)}
                >
                  credits
                </button>
                <button
                  data-tooltip-id="t"
                  data-tooltip-content={"Settings Page"}
                  className="mini"
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
                  onClick={() => {
                    setScreen(1);
                  }}
                >
                  cancel
                </button>
                <button
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
            </div>
            <br />
            <center>
              {" "}
              <button
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
