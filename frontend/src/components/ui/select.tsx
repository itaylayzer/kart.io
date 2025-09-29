import * as React from "react";
import { cn } from "./utils";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <select
                ref={ref}
                className={cn(
                    "flex h-10 w-full appearance-none rounded-md border border-neutral-700 bg-neutral-950 px-4 pr-10 text-left text-base text-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {children}
            </select>
        );
    }
);

Select.displayName = "Select";

export const SelectOption = (
    props: React.OptionHTMLAttributes<HTMLOptionElement>
) => {
    return <option {...props} />;
};
