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
import { useState, useEffect } from "react";

interface StringInputDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    placeholder?: string;
    submitLabel?: string;
    type?: "text" | "password";
    onSubmit: (value: string) => void;
    defaultValue?: string;
}

export function StringInputDialog({
    open,
    onOpenChange,
    title,
    description,
    placeholder = "",
    submitLabel = "Submit",
    type = "text",
    onSubmit,
    defaultValue = "",
}: StringInputDialogProps) {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (open) {
            setValue(defaultValue);
        }
    }, [open, defaultValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(value);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && (
                            <DialogDescription>{description}</DialogDescription>
                        )}
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="string-input">{title}</Label>
                            <Input
                                id="string-input"
                                type={type}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={placeholder}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">{submitLabel}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
