import { Play } from "@/components/Play";
import AssetLoader from "@/components/AssetLoader";
import { Condition } from "@/components/Condition";
import { useRoomScreen } from "@/viewmodels/useRoomScreen";
import { useRouter } from "next/router";
import { ShaderScripts } from "@/components/ShaderScripts";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/hooks/useRoom";
import { StringInputDialog } from "@/components/ui/string-input-dialog";
import { useRef } from "react";
import { AudioContainer } from "@/lib/AudioContainer";
import { Copy, Loader2, LogOut, PlayCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import KartViewer from "@/components/3d/KartViewer";
import dynamic from "next/dynamic";

// Dynamically import KartViewer to avoid SSR issues if any (though it's client side usually)
// Adding no ssr just in case
const KartViewerComponent = dynamic(
    () => import("@/components/3d/KartViewer"),
    { ssr: false },
);

export default function RoomPage() {
    const router = useRouter();
    const [room, setRoom] = useRoom();
    const passwordSubmittedRef = useRef(false);

    const { roomId } = router.query;

    if (!router.isReady) return null;
    if (roomId !== room?.id || roomId == null || room == undefined) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-zinc-950 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    // Need password before we can join
    if (room.hasPassword && !room.password) {
        return (
            <>
                <div className="h-screen w-full flex items-center justify-center bg-zinc-950" />
                <StringInputDialog
                    open={true}
                    onOpenChange={(open) => {
                        if (!open && !passwordSubmittedRef.current)
                            router.push("/");
                        passwordSubmittedRef.current = false;
                    }}
                    title="Room Password"
                    description="This room is password protected."
                    placeholder="Enter password"
                    type="password"
                    submitLabel="Join"
                    onSubmit={(password) => {
                        passwordSubmittedRef.current = true;
                        setRoom(room.id, room.name, true, password);
                    }}
                />
            </>
        );
    }

    return <LobbyContent room={room} router={router} />;
}

function LobbyContent({ room, router }: { room: any; router: any }) {
    const {
        isConnected,
        players,
        toggleReady,
        ready,
        startGameScreen,
        gameStartTime,
        pid,
        socket,
        disconnect,
        map,
    } = useRoomScreen(room, router);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(room.id);
    };

    // Get current player's color
    const currentPlayer = players?.get(pid);
    const playerCount = players ? players.size : 0;

    // Player color logic (replicated from previous implementation roughly)
    // p[1] was the color index.
    const getPlayerColor = (p: any) => {
        if (!p) return "#ffffff";
        return `hsl(${p[1] * 60}, 70%, 50%)`;
    };

    return (
        <div className="min-h-screen w-full bg-zinc-950 text-foreground font-sans overflow-hidden">
            <AudioContainer />
            <ShaderScripts />

            <Condition
                conditions={startGameScreen}
                onTrue={
                    <Play
                        goBack={() => router.push("/")}
                        client={socket!}
                        players={players!}
                        pid={pid}
                        map={map}
                        gameStartTime={gameStartTime}
                    />
                }
                onFalse={
                    <div className="flex h-screen">
                        {/* Sidebar Lobby Info */}
                        <div className="w-full md:w-[400px] bg-zinc-900/50 border-r border-white/5 p-8 flex flex-col relative z-20 backdrop-blur-sm">
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                                        {room.name}
                                    </h1>
                                    <div
                                        className="flex items-center gap-2 group cursor-pointer"
                                        onClick={copyToClipboard}
                                    >
                                        <Badge
                                            variant="secondary"
                                            className="font-mono text-zinc-400 bg-zinc-900 hover:bg-zinc-800 transition-colors py-1 px-3 rounded-md border border-white/10"
                                        >
                                            {room.id}
                                        </Badge>
                                        <Copy className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                                    </div>
                                </div>

                                <Separator className="bg-white/5" />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-zinc-500 uppercase tracking-wider font-medium">
                                        <span className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />{" "}
                                            Players
                                        </span>
                                        <span>{playerCount} / 8</span>
                                    </div>

                                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                        <Condition
                                            conditions={isConnected}
                                            onTrue={
                                                players === undefined ? (
                                                    <div className="flex justify-center py-8">
                                                        <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
                                                    </div>
                                                ) : (
                                                    <div className="grid gap-2">
                                                        {Array.from(
                                                            players.entries(),
                                                        ).map(
                                                            ([id, p]: any) => (
                                                                <Card
                                                                    key={id}
                                                                    className={`bg-zinc-900/50 border-white/5 shadow-none group ${id === pid ? "border-l-4 border-l-blue-500" : ""}`}
                                                                >
                                                                    <CardContent className="p-3 flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <div
                                                                                className="w-3 h-3 rounded-full ring-2 ring-white/10"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        getPlayerColor(
                                                                                            p,
                                                                                        ),
                                                                                }}
                                                                            />
                                                                            <span className="font-medium text-sm text-zinc-300 group-hover:text-white transition-colors">
                                                                                {
                                                                                    p[0]
                                                                                }{" "}
                                                                                {id ===
                                                                                    pid && (
                                                                                    <span className="text-xs text-zinc-500 ml-1">
                                                                                        (You)
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <div
                                                                            className={`w-2 h-2 rounded-full ${+p[2] ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-700"}`}
                                                                        />
                                                                    </CardContent>
                                                                </Card>
                                                            ),
                                                        )}
                                                    </div>
                                                )
                                            }
                                            onFalse={
                                                <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
                                                    <Loader2 className="w-8 h-8 animate-spin" />
                                                    <span className="text-sm">
                                                        Connecting to server...
                                                    </span>
                                                </div>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
                                <Button
                                    className={`w-full h-12 text-base font-semibold tracking-wide ${ready ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-500"} text-white rounded-xl transition-all shadow-lg`}
                                    onClick={() => toggleReady()}
                                >
                                    {ready ? (
                                        <>Cancel Ready</>
                                    ) : (
                                        <>
                                            <PlayCircle className="w-4 h-4 mr-2" />{" "}
                                            Ready Up
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-10 rounded-xl"
                                    onClick={() => disconnect()}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />{" "}
                                    Disconnect
                                </Button>
                            </div>
                        </div>

                        {/* Right Area - Display Kart */}
                        <div className="flex-1 bg-zinc-950 relative overflow-hidden flex flex-col items-center justify-center">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 to-black pointer-events-none" />

                            <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
                                <h1 className="text-4xl font-black italic tracking-tighter text-white/10 lowercase scale-150 select-none">
                                    Your Machine
                                </h1>

                                {currentPlayer && (
                                    <div className="w-full h-[400px] relative">
                                        <KartViewerComponent
                                            color={getPlayerColor(
                                                currentPlayer,
                                            )}
                                        />

                                        {/* Color Indicator Label */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        getPlayerColor(
                                                            currentPlayer,
                                                        ),
                                                }}
                                            />
                                            <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
                                                Paint Check
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                }
            />

            <AssetLoader />
        </div>
    );
}
