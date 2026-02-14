import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MainMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    active?: boolean;
}

export function MainMenuButton({ children, className, active, ...props }: MainMenuButtonProps) {
    return (
        <Button
            variant="ghost"
            className={cn(
                "group relative w-full justify-start h-16 text-2xl font-bold tracking-tight transition-all duration-200",
                "text-zinc-400 hover:text-white",
                "bg-transparent hover:bg-transparent",
                "hover:pl-4", // Slight slide
                active && "text-white pl-4",
                className
            )}
            {...props}
        >
            <div className="flex items-center gap-4 relative z-10 w-full">
                {children}
            </div>
        </Button>
    );
}
