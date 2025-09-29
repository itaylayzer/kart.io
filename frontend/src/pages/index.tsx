import { Listed } from "../components/Listed";
import { useIndexScreen } from "../viewmodels/useIndexScreen";
import AssetLoader from "../components/AssetLoader";
import { FidgetSpinner } from "react-loader-spinner";
import { BiErrorAlt } from "react-icons/bi";
import { AudioContainer } from "../lib/AudioContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaLock } from "react-icons/fa";
import { useRouter } from "next/router";
import { useRoom } from "@/hooks/useRoom";

function Index() {
    const {
        loadRooms,
        rooms,
        screenIndex,
        playerName,
        setPlayerName,
        onPlayButton,
    } = useIndexScreen();

    const [, setRoom] = useRoom();

    const router = useRouter();

    return (
        <>
            <header>
                <AssetLoader />
            </header>
            <AudioContainer />

            <Listed
                index={screenIndex}
                childrens={[
                    <main>
                        <table className="instructions">
                            <tbody>
                                <tr>
                                    <th>keyboard key</th> <th>gamepad key</th>
                                    <th>action</th>
                                </tr>
                                <tr>
                                    <td> W / S </td> <td>A / B / 0 / 1 </td>
                                    <td>Accelerating </td>
                                </tr>
                                <tr>
                                    <td> A / D </td>
                                    <td>
                                        Right Axis X Axis / Npad Right / Npad
                                        Left
                                    </td>
                                    <td>Sterring Wheel </td>
                                </tr>
                                <tr>
                                    <td> Space </td> <td>R1 </td>{" "}
                                    <td>Drift </td>
                                </tr>
                                <tr>
                                    <td> Mouse Right </td> <td>L1 </td>
                                    <td>Show Scoreboard </td>
                                </tr>
                                <tr>
                                    <td> Mouse Left </td>
                                    <td>X / Y / 2 / 3 / L2 / R2 </td>
                                    <td>Use Special </td>
                                </tr>
                                <tr>
                                    <td> Escape </td> <td>Start </td>
                                    <td>Unlock / Pause Menu </td>
                                </tr>
                                <tr>
                                    <td> Mouse Left </td> <td></td>
                                    <td>Switch Camera </td>
                                </tr>
                            </tbody>
                        </table>
                        <br />
                        <center
                            style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                            }}
                        >
                            <Input
                                data-tooltip-id="t"
                                data-tooltip-content={"Player Name"}
                                placeholder="Enter Player Name"
                                value={playerName}
                                onChange={(a) =>
                                    setPlayerName(a.currentTarget.value)
                                }
                            />
                        </center>
                        <br />
                        <br />
                        <center>
                            <Button
                                className="min-w-[10rem]"
                                onClick={onPlayButton}
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
                                                fontSize: "2.6vh",
                                                opacity: 0.3,
                                            }}
                                        >
                                            {rooms.length === 0
                                                ? "No Rooms Founded"
                                                : ""}
                                        </p>
                                        <div
                                            style={{
                                                display: "block",
                                                maxHeight: "34.75vh",
                                                width: "57.35vh",
                                                overflowY: "scroll",
                                                overflowX: "hidden",
                                            }}
                                        >
                                            <center>
                                                {rooms.map((r) => (
                                                    <div
                                                        className="room"
                                                        onClick={() => {
                                                            setRoom(
                                                                r.roomId,
                                                                r.metadata
                                                                    .roomName,
                                                                r.metadata
                                                                    .hasPassword, //r[3],
                                                                undefined
                                                            );
                                                            router.push(
                                                                `/play/${r.roomId}/`
                                                            );
                                                        }}
                                                    >
                                                        <table>
                                                            <tbody>
                                                                <tr>
                                                                    <th></th>
                                                                    <th>id</th>
                                                                    <th>
                                                                        name
                                                                    </th>
                                                                    <th>
                                                                        players
                                                                        count
                                                                    </th>
                                                                </tr>
                                                                <tr>
                                                                    <tr>
                                                                        <FaLock
                                                                            opacity={
                                                                                +r
                                                                                    .metadata
                                                                                    .hasPassword
                                                                            }
                                                                            color="white"
                                                                            size={
                                                                                10
                                                                            }
                                                                        />
                                                                    </tr>
                                                                    <td
                                                                        style={{
                                                                            fontFamily:
                                                                                "monospace",
                                                                            fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        {r.roomId.toUpperCase()}
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            r
                                                                                .metadata
                                                                                .roomName
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            r.clients
                                                                        }{" "}
                                                                        /{" "}
                                                                        {
                                                                            r.maxClients
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ))}
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
                                    fontSize: "6.25vh",
                                    marginBottom: 0,
                                }}
                            >
                                Kart.IO
                            </h1>
                            <h6
                                style={{ marginTop: 0, marginBottom: 40 }}
                                onClick={() => {
                                    window.open("https://itaylayzer.github.io");
                                }}
                                onAuxClick={() => {
                                    window.open(
                                        "https://itaylayzer.github.io",
                                        "_blank"
                                    );
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
                                <Button
                                    data-tooltip-id="t"
                                    data-tooltip-content={"Reload Rooms"}
                                    className="h-12 min-w-[7rem] px-4 text-sm uppercase"
                                    onClick={() => loadRooms()}
                                >
                                    reload
                                </Button>
                                <Button
                                    data-tooltip-id="t"
                                    data-tooltip-content={"Create Room"}
                                    className="h-12 min-w-[7rem] px-4 text-sm uppercase"
                                    onClick={() => router.push("/create")}
                                >
                                    create
                                </Button>
                                <Button
                                    data-tooltip-id="t"
                                    data-tooltip-content={"Credits Page"}
                                    className="h-12 min-w-[7rem] px-4 text-sm uppercase"
                                    onClick={() => router.push("/credits")}
                                >
                                    credits
                                </Button>
                                <Button
                                    data-tooltip-id="t"
                                    data-tooltip-content={"Settings Page"}
                                    className="h-12 min-w-[7rem] px-4 text-sm uppercase"
                                    onClick={() => router.push("/settings")}
                                >
                                    settings
                                </Button>
                            </div>
                        </div>
                    </main>,
                ]}
            ></Listed>
        </>
    );
}

export default Index;
