import { Listed } from "../components/Listed";
import { useIndexScreen } from "../viewmodels/useIndexScreen";
import AssetLoader from "../components/AssetLoader";
import { AudioContainer } from "../lib/AudioContainer";
import { Button } from "@/components/ui/button";
import { MainMenuButton } from "@/components/menu/MainMenuButton";
import { useState } from "react";
import { useRouter } from "next/router";
import { useRoom } from "@/hooks/useRoom";
import JoinRaceDialog from "@/components/menu/JoinRaceDialog";
import JoinByCodeDialog from "@/components/menu/JoinByCodeDialog";
import CreateRaceDialog from "@/components/menu/CreateRaceDialog";
import KeybindsDialog from "@/components/menu/KeybindsDialog";
import CreditsDialog from "@/components/menu/CreditsDialog";
import SettingsDialog from "@/components/menu/SettingsDialog";
import { Gamepad2, List, Settings, Info, Plus, Keyboard, Ticket } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function Index() {
    const {
        loadRooms,
        rooms,
        quickPlay,
    } = useIndexScreen();
    const router = useRouter();
    const [, setRoom] = useRoom();

    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [joinByCodeDialogOpen, setJoinByCodeDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [keybindsDialogOpen, setKeybindsDialogOpen] = useState(false);
    const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-zinc-950 text-foreground overflow-hidden relative selection:bg-zinc-800 font-sans">
            <header>
                <AssetLoader />
            </header>
            <AudioContainer />

            {/* Ambient Background - Subtle & Deep */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black" />

            {/* Main Menu - Left Sidebar Layout (Centered) */}
            <main className="w-full h-screen flex relative z-10 animate-in fade-in duration-500">

                {/* Left Navigation Area - Vertically Centered */}
                <div className="w-full md:w-[450px] h-full flex flex-col justify-center px-12 md:px-20 relative z-20 bg-gradient-to-r from-zinc-950/80 to-transparent">

                    <div className="relative z-10 mb-12">
                        <h2 className="text-zinc-500 font-bold tracking-widest text-sm mb-2 opacity-80">KART.IO</h2>
                        <h1 className="text-5xl font-bold tracking-tight text-white mb-2">
                            MENU
                        </h1>
                        <div className="h-1 w-12 bg-white/20 rounded-full" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-3">
                        <MainMenuButton onClick={() => quickPlay(setRoom, router)}>
                            <Gamepad2 className="w-5 h-5 opacity-50 mr-2" />
                            Quick Play
                        </MainMenuButton>

                        <MainMenuButton onClick={() => {
                            loadRooms();
                            setJoinDialogOpen(true);
                        }}>
                            <List className="w-5 h-5 opacity-50 mr-2" />
                            Browser
                        </MainMenuButton>

                        <MainMenuButton onClick={() => setJoinByCodeDialogOpen(true)}>
                            <Ticket className="w-5 h-5 opacity-50 mr-2" />
                            Join
                        </MainMenuButton>

                        <MainMenuButton onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="w-5 h-5 opacity-50 mr-2" />
                            Create Race
                        </MainMenuButton>

                        <div className="mt-8 flex gap-4">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hover:bg-white/10 hover:text-white text-zinc-500 rounded-full transition-colors" onClick={() => setSettingsDialogOpen(true)}>
                                            <Settings className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p>Settings</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hover:bg-white/10 hover:text-white text-zinc-500 rounded-full transition-colors" onClick={() => setCreditsDialogOpen(true)}>
                                            <Info className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p>Credits</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hover:bg-white/10 hover:text-white text-zinc-500 rounded-full transition-colors" onClick={() => setKeybindsDialogOpen(true)}>
                                            <Keyboard className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p>Controls</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Footer Links in Sidebar */}
                    <div className="absolute bottom-8 left-12 md:left-20 z-50 pointer-events-auto">
                        <div className="text-zinc-800 text-xs font-mono">
                            <Link href="https://itaylayzer.github.io/" target="_blank" className="hover:text-zinc-500 transition-colors cursor-pointer block p-2 -ml-2">@itaylayzer</Link>
                            <span className="opacity-50">2026</span>
                        </div>
                    </div>
                </div>

                {/* Right / Hero Area - Empty for future animation */}
                <div className="flex-1 hidden md:flex items-center justify-center relative">
                    {/* Future Animation Area */}
                    <div className="absolute right-[20%] top-1/2 -translate-y-1/2 w-[500px] h-[300px] flex items-center justify-center border border-white/5 rounded-3xl border-dashed opacity-20">
                        <span className="text-zinc-700 font-mono text-xs uppercase tracking-widest">Future Animation Zone</span>
                    </div>
                </div>

                {/* Dialogs */}
                <JoinRaceDialog
                    open={joinDialogOpen}
                    onOpenChange={setJoinDialogOpen}
                    rooms={rooms}
                    isLoading={rooms === undefined}
                    onReload={loadRooms}
                />

                <JoinByCodeDialog
                    open={joinByCodeDialogOpen}
                    onOpenChange={setJoinByCodeDialogOpen}
                />

                <CreateRaceDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                />

                <KeybindsDialog
                    open={keybindsDialogOpen}
                    onOpenChange={setKeybindsDialogOpen}
                />

                <CreditsDialog
                    open={creditsDialogOpen}
                    onOpenChange={setCreditsDialogOpen}
                />

                <SettingsDialog
                    open={settingsDialogOpen}
                    onOpenChange={setSettingsDialogOpen}
                />
            </main>
        </div>
    );
}

export default Index;
