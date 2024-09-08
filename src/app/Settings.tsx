import { useSettingsScreen } from "../viewmodels/useSettingsScreen";
import Slider from "@mui/material/Slider";
import Select from "@mui/material/Select";
import { MenuItem, Input, Switch } from "@mui/material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AiFillSound } from "react-icons/ai";
import { IoIosSettings } from "react-icons/io";
import { PiGraphicsCardFill } from "react-icons/pi";
import { IoMdEye } from "react-icons/io";
import { Listed } from "../components/Listed";
import { Condition } from "../components/Condition";
import { CSSProperties } from "react";

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
  } = useSettingsScreen();

  return (
    <main style={style}>
      <h1 style={{ fontSize: 60 }}>Settings</h1>
      <center>
        <ToggleButtonGroup
          color="primary"
          value={nav}
          exclusive
          onChange={(_, i) => {
            if (i === null) return;
            setNav(i as number);
          }}
        >
          <ToggleButton
            data-tooltip-id="t"
            data-tooltip-content={"Game Settings"}
            value={0}
            className="r mini"
          >
            <IoIosSettings size={30} color="white" />
          </ToggleButton>
          <ToggleButton
            data-tooltip-id="t"
            data-tooltip-content={"Audio Settings"}
            value={1}
            className="r mini"
          >
            <AiFillSound size={30} color="white" />
          </ToggleButton>
          <ToggleButton
            data-tooltip-id="t"
            data-tooltip-content={"Graphics Settings"}
            value={2}
            className="r mini"
          >
            <PiGraphicsCardFill size={30} color="white" />
          </ToggleButton>
          <ToggleButton
            data-tooltip-id="t"
            data-tooltip-content={"Hide/Show Elements"}
            value={3}
            className="r mini"
          >
            <IoMdEye size={30} color="white" />
          </ToggleButton>
        </ToggleButtonGroup>
      </center>
      <div style={{ minHeight: 400 }}>
        <table id="settings">
          <Listed
            index={nav}
            childrens={[
              <>
                {" "}
                <tr>
                  <td>Player Name</td>
                  <td>
                    <Input
                      style={{
                        display: "inline-block",
                        width: 250,
                      }}
                      size="small"
                      data-tooltip-id="t"
                      data-tooltip-content={"Player Name"}
                      placeholder="Enter Player Name"
                      key={"playerName"}
                      value={playerName}
                      onChange={(a) =>
                        set({ playerName: a.currentTarget.value })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Display Players</td>{" "}
                  <td>
                    <Select
                      key={"useArrow"}
                      color="info"
                      style={{
                        color: "white",
                        width: 215,
                        height: 40,
                        textAlign: "center",
                        border: "1px solid #444",
                      }}
                      onChange={(event) => {
                        set({ useArrow: (event.target.value as number) === 1 });
                      }}
                      value={+useArrow}
                    >
                      <MenuItem value={0}>Circle</MenuItem>
                      <MenuItem value={1}>Arrow</MenuItem>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td>Fov Change Multiplier</td>{" "}
                  <td style={{ display: "flex", gap: 20 }}>
                    <Slider
                      key={"fovChange"}
                      min={0}
                      step={0.01}
                      max={1}
                      style={{ width: 150 }}
                      value={fovChange}
                      onChange={(_, value) =>
                        set({ fovChange: value as number })
                      }
                    />
                    <p style={{ fontFamily: "monospace" }}>
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
                      width: 215,
                    }}
                  >
                    <Switch
                      key={"displayVelocity"}
                      checked={displayVelocity}
                      onChange={(_, value) => set({ displayVelocity: value })}
                    />
                  </td>
                </tr>{" "}
              </>,
              <>
                <tr>
                  <td>Master Volume</td>
                  <td style={{ display: "flex", gap: 20 }}>
                    <Slider
                      key={"masterVolume"}
                      min={0}
                      step={0.01}
                      max={1}
                      style={{ width: 150 }}
                      value={masterVolume}
                      onChange={(_, value) => {
                        set({ masterVolume: value as number });
                      }}
                    />
                    <p style={{ fontFamily: "monospace" }}>
                      {masterVolume.toFixed(2)}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>Music Volume</td>
                  <td style={{ display: "flex", gap: 20 }}>
                    <Slider
                      key={"musicVolume"}
                      min={0}
                      step={0.01}
                      max={1}
                      style={{ width: 150 }}
                      value={musicVolume}
                      onChange={(_, value) => {
                        set({ musicVolume: value as number });
                      }}
                    />
                    <p style={{ fontFamily: "monospace" }}>
                      {musicVolume.toFixed(2)}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>SFX Volume</td>
                  <td style={{ display: "flex", gap: 20 }}>
                    <Slider
                      key={"sfxVolume"}
                      min={0}
                      step={0.01}
                      max={1}
                      style={{ width: 150 }}
                      value={sfxVolume}
                      onChange={(_, value) => {
                        set({ sfxVolume: value as number });
                      }}
                    />
                    <p style={{ fontFamily: "monospace" }}>
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
                      width: 215,
                    }}
                  >
                    <Switch
                      key={"displayAudio"}
                      checked={displayAudio}
                      onChange={(_, value) => set({ displayAudio: value })}
                    />
                  </td>
                </tr>{" "}
              </>,
              <>
                <tr
                  style={{
                    opacity: `${0.5 + 0.5 * +!useVsync}`,
                    transition: "opacity .2s",
                  }}
                >
                  <td>FPS</td>
                  <td style={{ display: "flex", gap: 20 }}>
                    <Slider
                      key={"fps"}
                      min={15}
                      step={5}
                      max={120}
                      style={{ width: 150 }}
                      value={fps}
                      onChange={(_, value) => {
                        set({ fps: value as number });
                      }}
                    />
                    <p style={{ fontFamily: "monospace" }}>
                      {fps.toString().padStart(3, " ")}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>VSync</td>
                  <td
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      width: 215,
                    }}
                  >
                    <Switch
                      key={"useVsync"}
                      checked={useVsync}
                      onChange={(_, value) => set({ useVsync: value })}
                    />
                  </td>
                </tr>{" "}
                <tr>
                  <td data-tooltip-id="t" data-tooltip-content="FPS, MS, MB">
                    Display Stats
                  </td>
                  <td
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      width: 215,
                    }}
                  >
                    <Switch
                      key={"useSTATS"}
                      checked={useSTATS}
                      onChange={(_, value) => set({ useSTATS: value })}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Use Bloom</td>
                  <td
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      width: 215,
                    }}
                  >
                    <Switch
                      key={"useBloom"}
                      checked={useBloom}
                      onChange={(_, value) => set({ useBloom: value })}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Antialiasing</td>
                  <td
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      width: 215,
                    }}
                  >
                    <Switch
                      key={"Antialiasing"}
                      checked={Antialiasing}
                      onChange={(_, value) => set({ Antialiasing: value })}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Render Colliders</td>
                  <td
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      width: 215,
                    }}
                  >
                    <Switch
                      checked={renderColliders}
                      onChange={(_, value) => set({ renderColliders: value })}
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
                      width: 215,
                    }}
                  >
                    <Switch
                      key={"displaySun"}
                      checked={displaySun}
                      onChange={(_, value) => set({ displaySun: value })}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Display Fences</td>
                  <td
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      width: 215,
                    }}
                  >
                    <Switch
                      key={"displayFences"}
                      checked={displayFences}
                      onChange={(_, value) => set({ displayFences: value })}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Display Fences Pillars</td>
                  <td
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      width: 215,
                    }}
                  >
                    <Switch
                      key={"displayPillars"}
                      checked={displayPillars}
                      onChange={(_, value) => set({ displayPillars: value })}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Display Water</td>
                  <td
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      width: 215,
                    }}
                  >
                    <Switch
                      key={"displayWater"}
                      checked={displayWater}
                      onChange={(_, value) => set({ displayWater: value })}
                    />
                  </td>
                </tr>
              </>,
            ]}
          />
        </table>
      </div>
      <br />
      <br />

      <Condition
        conditions={goBack === undefined}
        onTrue={
          <button className="r" id={backButtonID}>
            Back
          </button>
        }
        onFalse={
          <button className="r" onClick={() => goBack!()}>
            Back
          </button>
        }
      />

      <button
        className="r"
        data-tooltip-id="t"
        data-tooltip-content={"Load From Cookies"}
        onClick={() => loadFromCookies(true)}
      >
        Load
      </button>
      <button
        className="r"
        data-tooltip-id="t"
        data-tooltip-content={"Save to Cookies"}
        onClick={() => saveToCookies(true)}
      >
        Save
      </button>
      <button
        className="r"
        data-tooltip-id="t"
        data-tooltip-content={"Reset to defaults"}
        onClick={() => reset()}
      >
        Reset
      </button>
    </main>
  );
}
