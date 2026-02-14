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
import { Lock } from "lucide-react";
import { useRouter } from "next/router";
import { useRoom } from "@/hooks/useRoom";
import { useState } from "react";
import { toast } from "sonner";

interface JoinByCodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function JoinByCodeDialog({
    open,
    onOpenChange,
}: JoinByCodeDialogProps) {
    const router = useRouter();
    const [, setRoom] = useRoom();
    const [roomCode, setRoomCode] = useState("");
    const [password, setPassword] = useState("");

    const handleJoin = () => {
        const code = roomCode.trim();
        if (!code) {
            toast.error("Please enter a room code");
            return;
        }
        setRoom(code, "Room", password.length > 0, password || undefined);
        onOpenChange(false);
        router.push(`/play/${code}/`);
        setRoomCode("");
        setPassword("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Join by Code</DialogTitle>
                    <DialogDescription>
                        Enter the room code shared by the host.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="room-code">Room Code</Label>
                        <Input
                            id="room-code"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            placeholder="e.g. abc123"
                            className="font-mono"
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="join-password">
                            Password (Optional)
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="join-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave empty if no password"
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleJoin}>Join</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
