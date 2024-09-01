import { ToastContainer } from "react-toastify";
import { Listed } from "../components/Listed";
import { useIndexScreen } from "../viewmodels/useIndexScreen";
import { Condition } from "../components/Condition";
import { Room } from "./Room";
import AssetLoader from "../components/AssetLoader";
import { FidgetSpinner } from "react-loader-spinner";
import { BiErrorAlt } from "react-icons/bi";
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
        conditions={screenIndex < 3}
        onTrue={
          <>
            <div className="blocks header" />
            <div className="blocks footer" />
            <footer>
              <a>credits</a>
            </footer>
            <header>
              {" "}
              <AssetLoader
                items={{
                  car: "fbx/kart.glb",
                  // sfx_throw:"https://soxundbible.com/mp3/kung_fu_punch-Mike_Koenig-2097967259.mp3"
                  sfx_throw: "sfx/throw.mp3",
                  sfx_exp: "sfx/exp.mp3",
                  sfx_shoot: "sfx/shoot.mp3",
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
              domain: <a href="http://localhost:3000">localhost:3000</a> <br />
              Edit this url, and add your username at the end, after the '/'.{" "}
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
                {Array.isArray(rooms) ? (
                  <>
                    <p>{rooms.length === 0 ? "no rooms founded" : ""}</p>
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
                                setScreen(3);
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
                <button className="mini" onClick={() => loadRooms()}>
                  reload
                </button>
                <button className="mini" onClick={() => setScreen(2)}>
                  create
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
