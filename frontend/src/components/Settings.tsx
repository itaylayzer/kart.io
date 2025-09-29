import { useSettingsScreen } from "../viewmodels/useSettingsScreen";
import { AiFillSound } from "react-icons/ai";
import { IoIosSettings } from "react-icons/io";
import { PiGraphicsCardFill } from "react-icons/pi";
import { IoMdEye } from "react-icons/io";
import { Listed } from "../components/Listed";
import { Condition } from "../components/Condition";
import { CSSProperties } from "react";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
export function Settings({
    goBack,
    style,
    backButtonID,
}: {
    goBack?: () => void;
    backButtonID?: string;
    style?: CSSProperties;
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

    return (
        <main style={style}>
            <h1 style={{ fontSize: "6.0vh" }}>Settings</h1>
            <div className="flex justify-center">
                <ToggleGroup
                    value={nav}
                    onValueChange={(value) => setNav(Number(value))}
                    className="flex gap-4"
                >
                    <ToggleGroupItem
                        data-tooltip-id="t"
                        data-tooltip-content={"Game Settings"}
                        value={0}
                        className="h-12 w-12 rounded-md border border-neutral-700 bg-neutral-950 hover:border-neutral-500 hover:bg-neutral-900"
                    >
                        <IoIosSettings size={30} color="white" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        data-tooltip-id="t"
                        data-tooltip-content={"Audio Settings"}
                        value={1}
                        className="h-12 w-12 rounded-md border border-neutral-700 bg-neutral-950 hover:border-neutral-500 hover:bg-neutral-900"
                    >
                        <AiFillSound size={30} color="white" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        data-tooltip-id="t"
                        data-tooltip-content={"Graphics Settings"}
                        value={2}
                        className="h-12 w-12 rounded-md border border-neutral-700 bg-neutral-950 hover:border-neutral-500 hover:bg-neutral-900"
                    >
                        <PiGraphicsCardFill size={30} color="white" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        data-tooltip-id="t"
                        data-tooltip-content={"Hide/Show Elements"}
                        value={3}
                        className="h-12 w-12 rounded-md border border-neutral-700 bg-neutral-950 hover:border-neutral-500 hover:bg-neutral-900"
                    >
                        <IoMdEye size={30} color="white" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <div style={{ minHeight: "45.7vh" }}>
                <table id="settings">
                    <tbody>
                        <Listed
                            index={nav}
                            childrens={[
                                <>
                                    <tr>
                                        <td>Player Name</td>
                                        <td>
                                            <Input
                                                className="inline-block w-[26.06vh]"
                                                data-tooltip-id="t"
                                                data-tooltip-content={
                                                    "Player Name"
                                                }
                                                placeholder="Enter Player Name"
                                                key={"playerName"}
                                                value={playerName}
                                                onChange={(a) =>
                                                    set({
                                                        playerName:
                                                            a.currentTarget
                                                                .value,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Display Players</td>
                                        <td>
                                            <Select
                                                key={"useArrow"}
                                                className="h-10 w-[22.419vh] border border-neutral-700 bg-neutral-950 text-center text-white"
                                                onChange={(event) => {
                                                    set({
                                                        useArrow:
                                                            event.currentTarget
                                                                .value === "1",
                                                    });
                                                }}
                                                value={String(+useArrow)}
                                            >
                                                <SelectOption value="0">
                                                    Circle
                                                </SelectOption>
                                                <SelectOption value="1">
                                                    Arrow
                                                </SelectOption>
                                            </Select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Fov Change Multiplier</td>
                                        <td
                                            style={{ display: "flex", gap: 20 }}
                                        >
                                            <Slider
                                                key={"fovChange"}
                                                min={0}
                                                step={0.01}
                                                max={1}
                                                className="w-40"
                                                value={fovChange}
                                                onValueChange={(value) =>
                                                    set({ fovChange: value })
                                                }
                                            />
                                            <p
                                                style={{
                                                    fontFamily: "monospace",
                                                }}
                                            >
                                                {fovChange.toFixed(2)}
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Display Velocity</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"displayVelocity"}
                                                checked={displayVelocity}
                                                onCheckedChange={(value) =>
                                                    set({
                                                        displayVelocity: value,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                </>,
                                <>
                                    <tr>
                                        <td>Master Volume</td>
                                        <td
                                            style={{ display: "flex", gap: 20 }}
                                        >
                                            <Slider
                                                key={"masterVolume"}
                                                min={0}
                                                step={0.01}
                                                max={1}
                                                className="w-[15.64vh]"
                                                value={masterVolume}
                                                onValueChange={(value) => {
                                                    set({ masterVolume: value });
                                                }}
                                            />
                                            <p
                                                style={{
                                                    fontFamily: "monospace",
                                                }}
                                            >
                                                {masterVolume.toFixed(2)}
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Music Volume</td>
                                        <td
                                            style={{ display: "flex", gap: 20 }}
                                        >
                                            <Slider
                                                key={"musicVolume"}
                                                min={0}
                                                step={0.01}
                                                max={1}
                                                className="w-[15.64vh]"
                                                value={musicVolume}
                                                onValueChange={(value) => {
                                                    set({ musicVolume: value });
                                                }}
                                            />
                                            <p
                                                style={{
                                                    fontFamily: "monospace",
                                                }}
                                            >
                                                {musicVolume.toFixed(2)}
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>SFX Volume</td>
                                        <td
                                            style={{ display: "flex", gap: 20 }}
                                        >
                                            <Slider
                                                key={"sfxVolume"}
                                                min={0}
                                                step={0.01}
                                                max={1}
                                                className="w-[15.64vh]"
                                                value={sfxVolume}
                                                onValueChange={(value) => {
                                                    set({ sfxVolume: value });
                                                }}
                                            />
                                            <p
                                                style={{
                                                    fontFamily: "monospace",
                                                }}
                                            >
                                                {sfxVolume.toFixed(2)}
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Display Audio Bar</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"displayAudio"}
                                                checked={displayAudio}
                                                onCheckedChange={(value) =>
                                                    set({ displayAudio: value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                </>,
                                <>
                                    <tr
                                        style={{
                                            opacity: `${
                                                0.5 + 0.5 * +!useVsync
                                            }`,
                                            transition: "opacity .2s",
                                        }}
                                    >
                                        <td>FPS</td>
                                        <td
                                            style={{ display: "flex", gap: 20 }}
                                        >
                                            <Slider
                                                key={"fps"}
                                                min={15}
                                                step={5}
                                                max={120}
                                                className="w-[15.64vh]"
                                                value={fps}
                                                onValueChange={(value) => {
                                                    set({ fps: value });
                                                }}
                                            />
                                            <p
                                                style={{
                                                    fontFamily: "monospace",
                                                }}
                                            >
                                                {fps
                                                    .toString()
                                                    .padStart(3, " ")}
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>VSync</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"useVsync"}
                                                checked={useVsync}
                                                onCheckedChange={(value) =>
                                                    set({ useVsync: value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            data-tooltip-id="t"
                                            data-tooltip-content="FPS, MS, MB"
                                        >
                                            Display Stats
                                        </td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"useSTATS"}
                                                checked={useSTATS}
                                                onCheckedChange={(value) =>
                                                    set({ useSTATS: value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Use Bloom</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"useBloom"}
                                                checked={useBloom}
                                                onCheckedChange={(value) =>
                                                    set({ useBloom: value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Motion Blur</td>
                                        <td
                                            style={{ display: "flex", gap: 20 }}
                                        >
                                            <Slider
                                                key={"motionBlur"}
                                                min={0}
                                                step={5}
                                                max={100}
                                                className="w-[15.64vh]"
                                                value={motionBlur}
                                                onValueChange={(value) => {
                                                    set({ motionBlur: value });
                                                }}
                                            />
                                            <p
                                                style={{
                                                    fontFamily: "monospace",
                                                }}
                                            >
                                                {(
                                                    motionBlur.toString() + "%"
                                                ).padStart(4, " ")}
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Antialiasing</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"Antialiasing"}
                                                checked={Antialiasing}
                                                onCheckedChange={(value) =>
                                                    set({ Antialiasing: value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Render Colliders</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                checked={renderColliders}
                                                onCheckedChange={(value) =>
                                                    set({
                                                        renderColliders: value,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                </>,
                                <>
                                    <tr>
                                        <td>Display Sun</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"displaySun"}
                                                checked={displaySun}
                                                onCheckedChange={(value) =>
                                                    set({ displaySun: value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Display Stars</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"displayStars"}
                                                checked={displayStars}
                                                onCheckedChange={(value) =>
                                                    set({ displayStars: value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Display Fences</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"displayFences"}
                                                checked={displayFences}
                                                onCheckedChange={(value) =>
                                                    set({
                                                        displayFences: value,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Display Fences Pillars</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"displayPillars"}
                                                checked={displayPillars}
                                                onCheckedChange={(value) =>
                                                    set({
                                                        displayPillars: value,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Display Water</td>
                                        <td
                                            style={{
                                                display: "flex",
                                                justifyContent: "end",
                                                width: "22.419vh",
                                            }}
                                        >
                                            <Switch
                                                key={"displayWater"}
                                                checked={displayWater}
                                                onCheckedChange={(value) =>
                                                    set({ displayWater: value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                </>,
                            ]}
                        />
                    </tbody>
                </table>
            </div>
            <br />
            <br />

            <Condition
                conditions={goBack === undefined}
                onTrue={
                    <Button id={backButtonID} className="mt-6 min-w-[8rem]">
                        Back
                    </Button>
                }
                onFalse={
                    <Button className="mt-6 min-w-[8rem]" onClick={() => goBack!()}>
                        Back
                    </Button>
                }
            />

            <Button
                className="mt-4"
                data-tooltip-id="t"
                data-tooltip-content={"Load From Cookies"}
                onClick={() => loadFromCookies(true)}
            >
                Load
            </Button>
            <Button
                className="mt-4 ml-4"
                data-tooltip-id="t"
                data-tooltip-content={"Save to Cookies"}
                onClick={() => saveToCookies(true)}
            >
                Save
            </Button>
            <Button
                className="mt-4 ml-4"
                data-tooltip-id="t"
                data-tooltip-content={"Reset to defaults"}
                onClick={() => reset()}
            >
                Reset
            </Button>
        </main>
    );
}
