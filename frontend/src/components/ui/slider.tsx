import * as React from "react";
import { cn } from "./utils";

export interface SliderProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    value: number;
    onValueChange?: (value: number) => void;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
        return (
            <input
                ref={ref}
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(event) => onValueChange?.(event.currentTarget.valueAsNumber)}
                className={cn(
                    "h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-emerald-400",
                    className
                )}
                {...props}
            />
        );
    }
);

Slider.displayName = "Slider";
