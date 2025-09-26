import AssetLoader from "@/components/AssetLoader";
import { AudioContainer } from "@/lib/AudioContainer";
import { useCreateScreen } from "@/viewmodels/useCreateScreen";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export default function () {
    const {
        createRoom,
        roomMap,
        roomMapCanvasRef,
        roomName,
        roomPassword,
        router,
        setRoomMap,
        setRoomName,
        setRoomPassword,
    } = useCreateScreen();
    return (
        <>
            <header>
                <AssetLoader />
            </header>
            <AudioContainer />

            <main style={{ display: "flex", gap: 100 }}>
                <div>
                    <h1 style={{ fontSize: "4.17vh" }}>Map Selection</h1>
                    <center>
                        <ToggleButtonGroup
                            color="primary"
                            value={roomMap}
                            onChange={(_, i) => {
                                if (i === null) return;
                                setRoomMap(i as number);
                            }}
                            exclusive
                        >
                            <ToggleButton className="r mini" value={0}>
                                Horde
                            </ToggleButton>
                            <ToggleButton className="r mini" value={1}>
                                Hotel
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </center>
                    <br />
                    <canvas
                        width={500}
                        height={500}
                        style={{ width: "36.49vh", height: "36.49vh" }}
                        ref={roomMapCanvasRef}
                    ></canvas>
                </div>
                <div
                    style={{
                        display: "block",
                        marginBlock: "auto",
                        height: "31.28vh",
                        width: "0.52vh",
                        borderRadius: 10,
                        backgroundColor: "rgba(255,255,255,25%)",
                    }}
                ></div>
                <div style={{ width: "62.5vh", marginBlock: "auto" }}>
                    <h1 style={{ fontSize: "5.21vh" }}>Create Room</h1>
                    <input
                        style={{ marginBottom: 10, width: "100%" }}
                        type="text"
                        defaultValue={roomName}
                        placeholder="Room's Name"
                        onChange={(e) => setRoomName(e.currentTarget.value)}
                    />
                    <br />
                    <input
                        style={{ width: "100%" }}
                        defaultValue={roomPassword}
                        type="password"
                        placeholder="Room's Password"
                        onChange={(e) => setRoomPassword(e.currentTarget.value)}
                    />

                    <br />
                    <center>
                        <br />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-around",
                            }}
                        >
                            <button
                                className="r"
                                onClick={() => {
                                    router.push("/");
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
                </div>
            </main>
        </>
    );
}
