import * as React from "react";
import { cn } from "./utils";

type ToggleValue = string | number;

type ToggleGroupContextValue = {
    value: ToggleValue;
    onValueChange?: (value: ToggleValue) => void;
};

const ToggleGroupContext = React.createContext<
    ToggleGroupContextValue | undefined
>(undefined);

type ToggleGroupProps = {
    value: ToggleValue;
    onValueChange?: (value: ToggleValue) => void;
    className?: string;
    children: React.ReactNode;
};

export function ToggleGroup({
    value,
    onValueChange,
    className,
    children,
}: ToggleGroupProps) {
    return (
        <ToggleGroupContext.Provider value={{ value, onValueChange }}>
            <div className={cn("inline-flex gap-3", className)}>{children}</div>
        </ToggleGroupContext.Provider>
    );
}

type ToggleGroupItemProps = {
    value: ToggleValue;
    children: React.ReactNode;
    className?: string;
};

export function ToggleGroupItem({ value, children, className }: ToggleGroupItemProps) {
    const context = React.useContext(ToggleGroupContext);

    if (!context) {
        throw new Error("ToggleGroupItem must be used within ToggleGroup");
    }

    const isActive = context.value === value;

    return (
        <button
            type="button"
            onClick={() => context.onValueChange?.(value)}
            className={cn(
                "inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-md border border-neutral-700 bg-neutral-950 px-4 text-base text-neutral-100 transition-all hover:border-neutral-500 hover:bg-neutral-900",
                isActive && "border-neutral-100 bg-neutral-800",
                className
            )}
            data-state={isActive ? "on" : "off"}
        >
            {children}
        </button>
    );
}
