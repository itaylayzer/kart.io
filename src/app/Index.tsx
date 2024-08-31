import { ToastContainer } from "react-toastify";
import { Listed } from "../components/Listed";
import { useIndexScreen } from "../viewmodels/useIndexScreen";
import Play from "./Play";
import { Condition } from "../components/Condition";
export function Index() {
  const {
    playerName,
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
            <footer>
              <a>credits</a>
            </footer>
            <header></header>
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
        pauseOnFocusLoss
        draggable
        pauseOnHover
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
          <div>
            <main>
              <h1>Kart.IO</h1>{" "}
              <center>
                {" "}
                <div
                  style={{
                    width: "fit-content",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <button onClick={() => setScreen(2)}>Online</button>{" "}
                  <button onClick={() => setScreen(4)}>Local</button>
                </div>
              </center>
              <h6
                onClick={() => {
                  window.open("https://itaylayzer.github.io", "_blank");
                }}
              >
                © 2024 itaylayzer
              </h6>
            </main>
          </div>,
          <main>
            <div style={{ display: "flex", gap: 5, minWidth: "100%" }}>
              <h3 style={{ flexGrow: 1, minWidth: "20ch", width: "100%" }}>
                Rooms{" "}
              </h3>
              <button className="mini" onClick={() => loadRooms()}>
                reload
              </button>
              <button className="mini" onClick={() => setScreen(3)}>
                create
              </button>
              <button className="mini" onClick={() => setScreen(1)}>
                back
              </button>
            </div>
            <br />
            {Array.isArray(rooms) ? (
              <>
                <p>{rooms.length === 0 ? "no rooms founded" : ""}</p>
                <div
                  style={{
                    display: "block",
                    maxHeight: 500,
                    width: 550,
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                >
                  <center>
                    {rooms
                      .toSorted((a, b) => a[1].localeCompare(b[1]))
                      .map((r) => (
                        <div
                          className="room"
                          onClick={() => {
                            setRoom(r[0]);
                            setScreen(4);
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
              <p>loading</p>
            ) : (
              <p>error</p>
            )}
          </main>,
          <main>
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
                    setScreen(2);
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
          <Play room={room} name={playerName!} />,
        ]}
      ></Listed>
    </>
  );
}
