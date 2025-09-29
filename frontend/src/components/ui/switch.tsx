import * as React from "react";
import { cn } from "./utils";

export interface SwitchProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ className, checked = false, onCheckedChange, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onCheckedChange?.(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-12 items-center rounded-full border border-neutral-700 bg-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                    checked ? "bg-emerald-500/20 border-emerald-500" : "bg-neutral-900",
                    className
                )}
                {...props}
            >
                <span
                    className={cn(
                        "inline-block h-5 w-5 translate-x-1 rounded-full bg-neutral-100 transition-transform",
                        checked ? "translate-x-6 bg-emerald-400" : "translate-x-1"
                    )}
                />
            </button>
        );
    }
);

Switch.displayName = "Switch";
