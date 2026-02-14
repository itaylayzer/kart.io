
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { useCreateScreen } from "@/viewmodels/useCreateScreen";
import { Eye, Lock } from "lucide-react";
import { useEffect, useRef } from "react";
import { renderMap } from "@/game/player/WorldMap";
import { CatmullRomCurve3 } from "three";
import { createVectorsFromNumbers } from "@/game/api/setup/road";
import { curvePoints } from "@shared/config/road";

interface CreateRaceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateRaceDialog({ open, onOpenChange }: CreateRaceDialogProps) {
    const {
        createRoom,
        roomMap,
        roomName,
        roomPassword,
        roomVisible,
        setRoomMap,
        setRoomName,
        setRoomPassword,
        setRoomVisible,
        roomMapCanvasRef
    } = useCreateScreen();
    const previewContainerRef = useRef<HTMLDivElement>(null);

    // Size canvas to match container and render - no CSS scaling, draw at exact display size
    // Retry when opening: dialog content mounts async so refs may be null on first run
    useEffect(() => {
        if (!open) return;

        let cleanup: (() => void) | undefined;

        const tryRun = () => {
            const container = previewContainerRef.current;
            const canvas = roomMapCanvasRef.current;
            if (!container || !canvas) return;

            cleanup?.();

            const resizeAndRender = () => {
                const w = container.clientWidth;
                const h = container.clientHeight;
                if (w <= 0 || h <= 0) return;

                const size = Math.min(w, h);
                canvas.width = size;
                canvas.height = size;

                renderMap(
                    new CatmullRomCurve3(
                        createVectorsFromNumbers(curvePoints[roomMap])
                    ),
                    canvas,
                    size
                );
            };

            const observer = new ResizeObserver(resizeAndRender);
            observer.observe(container);
            resizeAndRender();

            cleanup = () => observer.disconnect();
        };

        tryRun();
        const t1 = setTimeout(tryRun, 50);
        const t2 = setTimeout(tryRun, 150);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            cleanup?.();
        };
    }, [open, roomMap, roomMapCanvasRef]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Create Race</DialogTitle>
                    <DialogDescription>
                        Set up your lobby settings below.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Map Selection - Restored Canvas Visual */}
                    <div className="space-y-3">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Track</Label>
                        <div className="grid grid-cols-2 gap-4 h-48">
                            <div
                                ref={previewContainerRef}
                                className="col-span-1 border rounded-md bg-zinc-900/50 overflow-hidden relative group flex items-center justify-center aspect-square"
                            >
                                <canvas
                                    ref={roomMapCanvasRef}
                                    className="block opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute bottom-2 left-2 text-xs font-mono text-zinc-500 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                                    Preview
                                </div>
                            </div>

                            <div className="col-span-1 flex flex-col gap-2">
                                <ToggleGroup
                                    type="single"
                                    value={roomMap.toString()}
                                    onValueChange={(value) => {
                                        if (value === null) return;
                                        setRoomMap(parseInt(value));
                                    }}
                                    className="flex flex-col gap-2 h-full"
                                >
                                    <ToggleGroupItem value="0" className="flex-1 border w-full justify-center px-4 data-[state=on]:border-primary data-[state=on]:bg-primary/10 transition-all">
                                        <span className="text-sm font-medium">Horde</span>
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="1" className="flex-1 border w-full justify-center px-4 data-[state=on]:border-primary data-[state=on]:bg-primary/10 transition-all">
                                        <span className="text-sm font-medium">Hotel</span>
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Room Name</Label>
                            <Input
                                id="name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="My Race"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password (Optional)</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    value={roomPassword}
                                    onChange={(e) => setRoomPassword(e.target.value)}
                                    type="password"
                                    className="pl-9"
                                    placeholder="Leave empty for public"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <Label htmlFor="visible" className="cursor-pointer">Show in Browser</Label>
                            </div>
                            <Switch
                                id="visible"
                                checked={roomVisible}
                                onCheckedChange={setRoomVisible}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => createRoom()} className="w-full">
                        Create Lobby
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
