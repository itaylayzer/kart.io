import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface KeybindsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const keybinds = [
    { action: "Accelerating", keyboard: "W/S", gamepad: "A/B/0/1" },
    {
        action: "Steering Wheel",
        keyboard: "A/D",
        gamepad: "Right Axis X Axis / Npad Right / Npad Left",
    },
    { action: "Drift", keyboard: "Space", gamepad: "R1" },
    { action: "Show Scoreboard", keyboard: "Mouse Right", gamepad: "L1" },
    { action: "Use Special", keyboard: "Mouse Left", gamepad: "X/Y/2/3/L2/R2" },
    { action: "Unlock / Pause Menu", keyboard: "Escape", gamepad: "Start" },
    { action: "Switch Camera", keyboard: "Mouse Left", gamepad: "—" },
];

export default function KeybindsDialog({
    open,
    onOpenChange,
}: KeybindsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] md:min-w-3xl">
                <DialogHeader>
                    <DialogTitle>Controls</DialogTitle>
                    <DialogDescription>
                        Keyboard and gamepad controls for Kart.IO.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-md border border-white/10">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableHead className="text-zinc-400">
                                    Action
                                </TableHead>
                                <TableHead className="text-zinc-400">
                                    Keyboard Key
                                </TableHead>
                                <TableHead className="text-zinc-400">
                                    Gamepad Key
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keybinds.map((bind) => (
                                <TableRow
                                    key={bind.action}
                                    className="border-white/10 hover:bg-white/5"
                                >
                                    <TableCell className="font-medium text-zinc-200">
                                        {bind.action}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-zinc-400">
                                        {bind.keyboard}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-zinc-400">
                                        {bind.gamepad}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
