import { useSettingsScreen } from "../viewmodels/useSettingsScreen";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AiFillSound } from "react-icons/ai";
import { IoIosSettings } from "react-icons/io";
import { PiGraphicsCardFill } from "react-icons/pi";
import { IoMdEye } from "react-icons/io";
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function Settings({
    goBack,
    style,
    backButtonID,
    className,
    inDialog,
}: {
    goBack?: () => void;
    backButtonID?: string;
    style?: CSSProperties;
    className?: string;
    inDialog?: boolean;
}) {
    const {
        loadFromCookies,
        saveToCookies,
        reset,
        set,
        useArrow,
        fovChange,
        masterVolume,
        displaySun,
        useBloom,
        renderColliders,
        displayVelocity,
        setNav,
        nav,
        Antialiasing,
        musicVolume,
        sfxVolume,
        displayAudio,
        fps,
        useSTATS,
        useVsync,
        playerName,
        displayFences,
        displayPillars,
        displayWater,
        displayStars,
        motionBlur,
    } = useSettingsScreen();

    const renderSettingRow = (
        label: string,
        control: React.ReactNode,
        description?: string,
    ) => (
        <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 px-2 rounded-md transition-colors">
            <div className="space-y-0.5">
                <Label className="text-base">{label}</Label>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            <div className="w-[200px] flex justify-end">{control}</div>
        </div>
    );

    return (
        <main
            className={cn(
                "flex items-center justify-center w-full",
                inDialog ? "p-0" : "p-4 min-h-screen",
                className,
            )}
            style={style}
        >
            <Card
                className={cn(
                    "w-full bg-card/80 backdrop-blur-md border border-border shadow-xl flex flex-col",
                    inDialog
                        ? "max-w-none border-0 rounded-none max-h-[85vh]"
                        : "max-w-4xl h-[85vh]",
                )}
            >
                <CardHeader className="space-y-6">
                    <CardTitle className="text-center text-4xl font-light tracking-widest uppercase">
                        Settings
                    </CardTitle>
                    <div className="flex justify-center">
                        <ToggleGroup
                            type="single"
                            value={nav.toString()}
                            onValueChange={(value) => {
                                if (value === null) return;
                                setNav(parseInt(value));
                            }}
                            className=" p-1 rounded-lg"
                        >
                            <ToggleGroupItem
                                value="0"
                                aria-label="Game Settings"
                                className="px-6 py-2"
                            >
                                <IoIosSettings className="w-5 h-5 mr-2" />
                                <span className="hidden sm:inline">Game</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="1"
                                aria-label="Audio Settings"
                                className="px-6 py-2"
                            >
                                <AiFillSound className="w-5 h-5 mr-2" />
                                <span className="hidden sm:inline">Audio</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="2"
                                aria-label="Graphics Settings"
                                className="px-6 py-2"
                            >
                                <PiGraphicsCardFill className="w-5 h-5 mr-2" />
                                <span className="hidden sm:inline">
                                    Graphics
                                </span>
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="3"
                                aria-label="Display Settings"
                                className="px-6 py-2"
                            >
                                <IoMdEye className="w-5 h-5 mr-2" />
                                <span className="hidden sm:inline">
                                    Display
                                </span>
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto px-8 py-4">
                    <div className="space-y-1">
                        {nav === 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {renderSettingRow(
                                    "Player Name",
                                    <Input
                                        className="h-9"
                                        placeholder="Enter Name"
                                        value={playerName}
                                        onChange={(e) =>
                                            set({ playerName: e.target.value })
                                        }
                                    />,
                                )}
                                {renderSettingRow(
                                    "Player Indicator",
                                    <Select
                                        value={useArrow ? "1" : "0"}
                                        onValueChange={(val) =>
                                            set({ useArrow: val === "1" })
                                        }
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">
                                                Circle
                                            </SelectItem>
                                            <SelectItem value="1">
                                                Arrow
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>,
                                    "Visual indicator above your kart",
                                )}
                                {renderSettingRow(
                                    "FOV Multiplier",
                                    <div className="flex items-center gap-4 w-full">
                                        <Slider
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={[fovChange]}
                                            onValueChange={(val) =>
                                                set({ fovChange: val[0] })
                                            }
                                            className="flex-1 "
                                        />
                                        <span className="font-mono text-xs w-8 text-right">
                                            {fovChange.toFixed(2)}
                                        </span>
                                    </div>,
                                    "Field of view dynamic change intensity",
                                )}
                                {renderSettingRow(
                                    "Show Velocity",
                                    <Switch
                                        checked={displayVelocity}
                                        onCheckedChange={(val) =>
                                            set({ displayVelocity: val })
                                        }
                                    />,
                                )}
                            </div>
                        )}

                        {nav === 1 && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {renderSettingRow(
                                    "Master Volume",
                                    <div className="flex items-center gap-4 w-full">
                                        <Slider
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={[masterVolume]}
                                            onValueChange={(val) =>
                                                set({ masterVolume: val[0] })
                                            }
                                            className="flex-1"
                                        />
                                        <span className="font-mono text-xs w-8 text-right">
                                            {Math.round(masterVolume * 100)}%
                                        </span>
                                    </div>,
                                )}
                                {renderSettingRow(
                                    "Music Volume",
                                    <div className="flex items-center gap-4 w-full">
                                        <Slider
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={[musicVolume]}
                                            onValueChange={(val) =>
                                                set({ musicVolume: val[0] })
                                            }
                                            className="flex-1"
                                        />
                                        <span className="font-mono text-xs w-8 text-right">
                                            {Math.round(musicVolume * 100)}%
                                        </span>
                                    </div>,
                                )}
                                {renderSettingRow(
                                    "SFX Volume",
                                    <div className="flex items-center gap-4 w-full">
                                        <Slider
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={[sfxVolume]}
                                            onValueChange={(val) =>
                                                set({ sfxVolume: val[0] })
                                            }
                                            className="flex-1"
                                        />
                                        <span className="font-mono text-xs w-8 text-right">
                                            {Math.round(sfxVolume * 100)}%
                                        </span>
                                    </div>,
                                )}
                                {renderSettingRow(
                                    "Audio Visualizer",
                                    <Switch
                                        checked={displayAudio}
                                        onCheckedChange={(val) =>
                                            set({ displayAudio: val })
                                        }
                                    />,
                                )}
                            </div>
                        )}

                        {nav === 2 && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {renderSettingRow(
                                    "Target FPS",
                                    <div className="flex items-center gap-4 w-full">
                                        <Slider
                                            min={15}
                                            max={120}
                                            step={5}
                                            value={[fps]}
                                            onValueChange={(val) =>
                                                set({ fps: val[0] })
                                            }
                                            className="flex-1"
                                            disabled={useVsync}
                                        />
                                        <span className="font-mono text-xs w-8 text-right">
                                            {fps}
                                        </span>
                                    </div>,
                                    useVsync
                                        ? "Controlled by VSync"
                                        : "Target frame rate limit",
                                )}
                                {renderSettingRow(
                                    "VSync",
                                    <Switch
                                        checked={useVsync}
                                        onCheckedChange={(val) =>
                                            set({ useVsync: val })
                                        }
                                    />,
                                )}
                                {renderSettingRow(
                                    "Performance Stats",
                                    <Switch
                                        checked={useSTATS}
                                        onCheckedChange={(val) =>
                                            set({ useSTATS: val })
                                        }
                                    />,
                                    "Show FPS, ping and memory usage",
                                )}
                                {renderSettingRow(
                                    "Bloom Effect",
                                    <Switch
                                        checked={useBloom}
                                        onCheckedChange={(val) =>
                                            set({ useBloom: val })
                                        }
                                    />,
                                )}
                                {renderSettingRow(
                                    "Motion Blur",
                                    <div className="flex items-center gap-4 w-full">
                                        <Slider
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={[motionBlur]}
                                            onValueChange={(val) =>
                                                set({ motionBlur: val[0] })
                                            }
                                            className="flex-1"
                                        />
                                        <span className="font-mono text-xs w-8 text-right">
                                            {motionBlur}%
                                        </span>
                                    </div>,
                                )}
                                {renderSettingRow(
                                    "Anti-aliasing",
                                    <Switch
                                        checked={Antialiasing}
                                        onCheckedChange={(val) =>
                                            set({ Antialiasing: val })
                                        }
                                    />,
                                )}
                                {renderSettingRow(
                                    "Debug Colliders",
                                    <Switch
                                        checked={renderColliders}
                                        onCheckedChange={(val) =>
                                            set({ renderColliders: val })
                                        }
                                    />,
                                )}
                            </div>
                        )}

                        {nav === 3 && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {renderSettingRow(
                                    "Sun",
                                    <Switch
                                        checked={displaySun}
                                        onCheckedChange={(val) =>
                                            set({ displaySun: val })
                                        }
                                    />,
                                )}
                                {renderSettingRow(
                                    "Stars",
                                    <Switch
                                        checked={displayStars}
                                        onCheckedChange={(val) =>
                                            set({ displayStars: val })
                                        }
                                    />,
                                )}
                                {renderSettingRow(
                                    "Fences",
                                    <Switch
                                        checked={displayFences}
                                        onCheckedChange={(val) =>
                                            set({ displayFences: val })
                                        }
                                    />,
                                )}
                                {renderSettingRow(
                                    "Fence Pillars",
                                    <Switch
                                        checked={displayPillars}
                                        onCheckedChange={(val) =>
                                            set({ displayPillars: val })
                                        }
                                    />,
                                )}
                                {renderSettingRow(
                                    "Water",
                                    <Switch
                                        checked={displayWater}
                                        onCheckedChange={(val) =>
                                            set({ displayWater: val })
                                        }
                                    />,
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t border-border/50 p-6">
                    <div className="flex gap-2">
                        {goBack && (
                            <Button
                                variant="outline"
                                onClick={goBack}
                                id={backButtonID}
                            >
                                Back
                            </Button>
                        )}
                        {!goBack && (
                            <Button variant="outline" disabled>
                                Back
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => loadFromCookies(true)}
                        >
                            Load
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => saveToCookies(true)}
                        >
                            Save
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-blue-600"
                            onClick={() => reset()}
                        >
                            Reset
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </main>
    );
}
