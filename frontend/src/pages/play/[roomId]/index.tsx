import { Play } from "@/components/Play";
import AssetLoader from "@/components/AssetLoader";
import { Condition } from "@/components/Condition";
import { LoadingWheelSVG } from "@/components/LoadingWheelSVG";
import { COLORS } from "@/game/player/Player";
import { useRoom } from "@/hooks/useRoom";
import { AudioContainer } from "@/lib/AudioContainer";
import { useRoomScreen } from "@/viewmodels/useRoomScreen";
import { useRouter } from "next/router";
import { GoDotFill } from "react-icons/go";

export default function () {
    const [room] = useRoom();
    const router = useRouter();

    const { roomId } = router.query;

    if (roomId !== room?.id || roomId == null || room == undefined)
        return <>{JSON.stringify({ roomId, room })}</>;

    const Element = () => {
        const {
            isConnected,
            players,
            toggleReady,
            ready,
            startGameScreen,
            pid,
            socket,
            disconnect,
            map,
        } = useRoomScreen(room, router);
        return (
            <>
                <header>
                    <AssetLoader />
                </header>
                <AudioContainer />
                <Condition
                    conditions={startGameScreen}
                    onTrue={
                        <Play
                            goBack={() => router.push("/")}
                            client={socket!}
                            players={players!}
                            pid={pid}
                            map={map}
                        />
                    }
                    onFalse={
                        <main style={{ display: "flex" }}>
                            <Condition
                                conditions={isConnected}
                                onTrue={
                                    players === undefined ? (
                                        <LoadingWheelSVG size={80} />
                                    ) : (
                                        <div
                                            style={{ display: "flex", gap: 50 }}
                                        >
                                            <div
                                                style={{
                                                    marginBlock: "auto",
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fill, minmax(150px, 1fr))",
                                                    gridAutoRows:
                                                        "minmax(20px, auto)",
                                                    columnGap: 20,
                                                    maxHeight: "83.42vh",
                                                    width: "52.13vh",
                                                }}
                                            >
                                                {Array.from(
                                                    players.entries()
                                                ).map(([id, p]) => (
                                                    <div
                                                        key={id}
                                                        className="player"
                                                        style={{
                                                            scale: `${
                                                                0.9 +
                                                                0.1 * +p[2]
                                                            }`,
                                                            opacity:
                                                                0.8 +
                                                                0.2 * +p[2],
                                                        }}
                                                    >
                                                        <div>
                                                            <GoDotFill
                                                                color={
                                                                    COLORS[p[1]]
                                                                }
                                                                style={{
                                                                    marginBlock:
                                                                        "auto",
                                                                }}
                                                            />
                                                            <p> {p[0]}</p>
                                                            <GoDotFill
                                                                color={
                                                                    [
                                                                        "white",
                                                                        "green",
                                                                    ][+p[2]]
                                                                }
                                                                style={{
                                                                    marginBlock:
                                                                        "auto",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div
                                                style={{
                                                    display: "block",
                                                    height: "31.28vh",
                                                    width: "0.52vh",
                                                    borderRadius: 10,
                                                    backgroundColor:
                                                        "rgba(255,255,255,25%)",
                                                }}
                                            ></div>
                                            <div
                                                style={{
                                                    display: "block",
                                                    marginBlock: "auto",
                                                }}
                                            >
                                                <h1
                                                    style={{
                                                        fontSize: "8.34vh",
                                                        marginBottom: 0,
                                                    }}
                                                >
                                                    {room.name}
                                                </h1>

                                                <h2
                                                    style={{
                                                        fontSize: "2vh",
                                                        marginTop: 0,
                                                    }}
                                                >
                                                    {room.id}
                                                </h2>

                                                <br />
                                                <br />
                                                <br />
                                                <br />
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 10,
                                                    }}
                                                >
                                                    <button
                                                        className="r"
                                                        onClick={() =>
                                                            disconnect()
                                                        }
                                                    >
                                                        Disconnect
                                                    </button>
                                                    <button
                                                        className="r"
                                                        onClick={() =>
                                                            toggleReady()
                                                        }
                                                    >
                                                        {
                                                            [
                                                                "Ready",
                                                                "Unready",
                                                            ][+ready]
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                onFalse={
                                    <LoadingWheelSVG size={80} color="red" />
                                }
                            />
                        </main>
                    }
                />
            </>
        );
    };
    return <Element />;
}
