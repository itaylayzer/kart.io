import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Settings } from "@/components/Settings";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({
    open,
    onOpenChange,
}: SettingsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 ">
                <Settings goBack={() => onOpenChange(false)} inDialog />
            </DialogContent>
        </Dialog>
    );
}
