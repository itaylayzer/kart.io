import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FidgetSpinner } from "react-loader-spinner";
import { BiErrorAlt } from "react-icons/bi";
import { Lock, RefreshCw, Users, Map } from "lucide-react";
import { RoomData } from "@/types/room";
import { useRouter } from "next/router";
import { useRoom } from "@/hooks/useRoom";
import { Badge } from "@/components/ui/badge";
import { StringInputDialog } from "@/components/ui/string-input-dialog";

interface JoinRaceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rooms: RoomData[] | Error | undefined;
    isLoading: boolean;
    onReload: () => void;
}

export default function JoinRaceDialog({ open, onOpenChange, rooms, isLoading, onReload }: JoinRaceDialogProps) {
    const router = useRouter();
    const [, setRoom] = useRoom();
    const [roomNeedingPassword, setRoomNeedingPassword] = useState<RoomData | null>(null);

    return (
        <>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader className="flex flex-row items-center justify-between pr-8">
                    <div className="space-y-1">
                        <DialogTitle>Join Race</DialogTitle>
                        <DialogDescription>Select a server to join the action.</DialogDescription>
                    </div>
                </DialogHeader>
                <div className="absolute right-12 top-6">
                    <Button variant="outline" size="icon" onClick={onReload} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                </div>

                <div className="h-[400px] overflow-y-auto border rounded-md mt-2">
                    {Array.isArray(rooms) ? (
                        <div className="grid gap-1 p-1">
                            {rooms.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground space-y-2">
                                    <Map className="w-12 h-12 opacity-20" />
                                    <p>No active races found.</p>
                                    <Button variant="link" onClick={onReload}>Refresh</Button>
                                </div>
                            )}
                            {rooms.map((r) => (
                                <button
                                    key={r.roomId}
                                    className="flex items-center justify-between p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group text-left"
                                    onClick={() => {
                                        if (r.metadata?.hasPassword) {
                                            setRoomNeedingPassword(r);
                                        } else {
                                            setRoom(r.roomId, r.metadata.roomName, false, undefined);
                                            router.push(`/play/${r.roomId}/`);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-muted px-2 py-1 rounded text-xs font-mono text-muted-foreground group-hover:bg-background group-hover:text-foreground transition-colors">
                                            {r.roomId.slice(0, 4).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{r.metadata.roomName}</span>
                                                {r.metadata.hasPassword && <Lock className="w-3 h-3 text-muted-foreground" />}
                                            </div>
                                            <span className="text-xs text-muted-foreground">Map: {r.metadata.roomMap === 0 ? "Horde" : "Hotel"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="font-mono font-normal">
                                            <Users className="w-3 h-3 mr-1" />
                                            {r.clients}/{r.maxClients}
                                        </Badge>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : rooms instanceof Error ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <BiErrorAlt className="text-destructive w-10 h-10" />
                            <p className="text-destructive font-medium">Failed to load rooms</p>
                            <Button variant="outline" onClick={onReload}>Retry</Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <FidgetSpinner
                                visible={true}
                                height="40"
                                width="40"
                                ariaLabel="loading"
                                backgroundColor="gray"
                                ballColors={["gray", "gray", "gray"]}
                            />
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>

        <StringInputDialog
            open={roomNeedingPassword !== null}
            onOpenChange={(o) => !o && setRoomNeedingPassword(null)}
            title="Room Password"
            description="This room is password protected."
            placeholder="Enter password"
            type="password"
            submitLabel="Join"
            onSubmit={(password) => {
                if (roomNeedingPassword) {
                    setRoom(roomNeedingPassword.roomId, roomNeedingPassword.metadata.roomName, true, password);
                    setRoomNeedingPassword(null);
                    onOpenChange(false);
                    router.push(`/play/${roomNeedingPassword.roomId}/`);
                }
            }}
        />
        </>
    );
}
