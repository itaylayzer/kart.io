import AssetLoader from "@/components/AssetLoader";
import { AudioContainer } from "@/lib/AudioContainer";
import { useCreateScreen } from "@/viewmodels/useCreateScreen";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

            <main className="flex gap-24">
                <div>
                    <h1 className="text-[4.17vh]">Map Selection</h1>
                    <div className="flex justify-center">
                        <ToggleGroup
                            value={roomMap}
                            onValueChange={(value) => setRoomMap(Number(value))}
                            className="gap-3"
                        >
                            <ToggleGroupItem
                                value={0}
                                className="h-12 min-w-[6rem] rounded-md border border-neutral-700 bg-neutral-950 px-6 text-lg text-white hover:border-neutral-500 hover:bg-neutral-900"
                            >
                                Horde
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value={1}
                                className="h-12 min-w-[6rem] rounded-md border border-neutral-700 bg-neutral-950 px-6 text-lg text-white hover:border-neutral-500 hover:bg-neutral-900"
                            >
                                Hotel
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <br />
                    <canvas
                        width={500}
                        height={500}
                        className="h-[36.49vh] w-[36.49vh]"
                        ref={roomMapCanvasRef}
                    ></canvas>
                </div>
                <div
                    className="my-auto block h-[31.28vh] w-[0.52vh] rounded-[10px] bg-[rgba(255,255,255,0.25)]"
                ></div>
                <div className="my-auto w-[62.5vh]">
                    <h1 className="text-[5.21vh]">Create Room</h1>
                    <Input
                        className="mb-2 w-full"
                        type="text"
                        defaultValue={roomName}
                        placeholder="Room's Name"
                        onChange={(e) => setRoomName(e.currentTarget.value)}
                    />
                    <br />
                    <Input
                        className="w-full"
                        defaultValue={roomPassword}
                        type="password"
                        placeholder="Room's Password"
                        onChange={(e) => setRoomPassword(e.currentTarget.value)}
                    />

                    <br />
                    <center>
                        <br />
                        <div
                            className="flex justify-around"
                        >
                            <Button
                                className="min-w-[8rem]"
                                onClick={() => {
                                    router.push("/");
                                }}
                            >
                                cancel
                            </Button>
                            <Button
                                className="min-w-[8rem]"
                                onClick={() => {
                                    createRoom();
                                }}
                            >
                                create room
                            </Button>
                        </div>
                    </center>
                </div>
            </main>
        </>
    );
}
