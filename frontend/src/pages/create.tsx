import AssetLoader from "@/components/AssetLoader";
import { AudioContainer } from "@/lib/AudioContainer";
import { useCreateScreen } from "@/viewmodels/useCreateScreen";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Create() {
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
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-950 to-black -z-10" />

            <header>
                <AssetLoader />
            </header>
            <AudioContainer />

            <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in zoom-in-95 duration-500 mx-auto">

                <Card className="w-full bg-zinc-950/80 backdrop-blur-md border-zinc-800 shadow-xl overflow-hidden aspect-[4/5] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-2xl font-light text-center tracking-wide">MAP SELECTION</CardTitle>
                        <CardDescription className="text-center">Choose your track</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-8 flex-1">
                        <ToggleGroup
                            type="single"
                            value={roomMap.toString()}
                            onValueChange={(value) => {
                                if (value === null) return;
                                setRoomMap(parseInt(value));
                            }}
                            className="bg-zinc-900 p-1 rounded-lg border border-zinc-800"
                        >
                            <ToggleGroupItem value="0" aria-label="Horde" className="px-6 data-[state=on]:bg-zinc-700 data-[state=on]:text-white transition-all">
                                Horde
                            </ToggleGroupItem>
                            <ToggleGroupItem value="1" aria-label="Hotel" className="px-6 data-[state=on]:bg-zinc-700 data-[state=on]:text-white transition-all">
                                Hotel
                            </ToggleGroupItem>
                        </ToggleGroup>

                        <div className="relative w-full max-w-[280px] aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-black shadow-inner flex items-center justify-center group ring-1 ring-zinc-800/50">
                            <canvas
                                width={500}
                                height={500}
                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                                ref={roomMapCanvasRef}
                            ></canvas>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full bg-zinc-950/80 backdrop-blur-md border-zinc-800 shadow-xl aspect-[4/5] flex flex-col justify-center">
                    <CardHeader>
                        <CardTitle className="text-2xl font-light text-center tracking-wide">ROOM DETAILS</CardTitle>
                        <CardDescription className="text-center">Configure your game room</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-10 pb-8">
                        <div className="space-y-2">
                            <Label>Room Name</Label>
                            <Input
                                type="text"
                                defaultValue={roomName}
                                placeholder="Enter a name..."
                                onChange={(e) => setRoomName(e.currentTarget.value)}
                                className="bg-black/40 border-zinc-800 h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                defaultValue={roomPassword}
                                type="password"
                                placeholder="Optional"
                                onChange={(e) => setRoomPassword(e.currentTarget.value)}
                                className="bg-black/40 border-zinc-800 h-12"
                            />
                        </div>

                        <div className="flex gap-4 pt-8">
                            <Button
                                variant="outline"
                                className="flex-1 border-zinc-700 hover:bg-zinc-800 h-12"
                                onClick={() => router.push("/")}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-white text-black hover:bg-zinc-200 h-12 font-bold"
                                onClick={() => createRoom()}
                            >
                                Create Room
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
