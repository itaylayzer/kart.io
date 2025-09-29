import * as React from "react";
import { cn } from "./utils";

export interface ProgressProps
    extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
    return (
        <div
            className={cn(
                "relative h-2 w-full overflow-hidden rounded-full bg-neutral-900",
                className
            )}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            {...props}
        >
            <div
                className="h-full w-full origin-left scale-x-[var(--progress)] transform bg-emerald-400 transition-transform duration-300"
                style={{
                    // clamp value between 0 and 100
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(value !== undefined
                        ? { "--progress": `${Math.min(Math.max(value, 0), 100) / 100}` }
                        : { "--progress": 0 }),
                } as React.CSSProperties}
            />
        </div>
    );
}
