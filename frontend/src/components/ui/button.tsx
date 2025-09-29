import * as React from "react";
import { cn } from "./utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
    default:
        "bg-neutral-900 text-white border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600",
    secondary:
        "bg-neutral-800 text-neutral-100 border border-neutral-700 hover:bg-neutral-700",
    outline:
        "border border-neutral-700 text-neutral-100 hover:bg-neutral-900",
    ghost: "text-neutral-100 hover:bg-neutral-900",
};

const sizeStyles: Record<ButtonSize, string> = {
    default: "h-10 px-6 py-2 text-base",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10 p-0",
};

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-50",
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
