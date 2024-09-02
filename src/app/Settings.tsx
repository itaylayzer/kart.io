import { useSettingsScreen } from "../viewmodels/useSettingsScreen";
import Slider from "@mui/material/Slider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AiFillSound } from "react-icons/ai";
import { IoIosSettings } from "react-icons/io";
import { PiGraphicsCardFill } from "react-icons/pi";
import { Listed } from "../components/Listed";
export function Settings({ goBack }: { goBack: () => void }) {
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
  } = useSettingsScreen();

  return (
    <main>
      <h1 style={{ fontSize: 60 }}>Settings</h1>
      <center>
        <ToggleButtonGroup
          color="primary"
          value={nav}
          exclusive
          onChange={(_, i) => {
            if (i === null) return;
            console.log(i);
            setNav(i as number);
          }}
        >
          <ToggleButton
            data-tooltip-id="t"
            data-tooltip-content={"Game Settings"}
            value={0}
            className="mini"
          >
            <IoIosSettings size={30} color="white" />
          </ToggleButton>
          <ToggleButton
            data-tooltip-id="t"
            data-tooltip-content={"Audio Settings"}
            value={1}
            className="mini"
          >
            <AiFillSound size={30} color="white" />
          </ToggleButton>
          <ToggleButton
            data-tooltip-id="t"
            data-tooltip-content={"Graphics Settings"}
            value={2}
            className="mini"
          >
            <PiGraphicsCardFill size={30} color="white" />
          </ToggleButton>
        </ToggleButtonGroup>
      </center>
      <div style={{ minHeight: 300 }}>
        <table id="settings">
          <Listed
            index={nav}
            childrens={[
              <>
                {" "}
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
                    onChange={(_, value) =>
                      set({ masterVolume: value as number })
                    }
                  />
                  <p style={{ fontFamily: "monospace" }}>
                    {masterVolume.toFixed(2)}
                  </p>
                </td>
              </tr>,
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
            ]}
          />
        </table>
      </div>
      <br />
      <br />
      <button onClick={() => goBack()}>Back</button>
      <button
        data-tooltip-id="t"
        data-tooltip-content={"Load From Cookies"}
        onClick={() => loadFromCookies()}
      >
        Load
      </button>
      <button
        data-tooltip-id="t"
        data-tooltip-content={"Save to Cookies"}
        onClick={() => saveToCookies()}
      >
        Save
      </button>
      <button
        data-tooltip-id="t"
        data-tooltip-content={"Reset to defaults"}
        onClick={() => reset()}
      >
        Reset
      </button>
    </main>
  );
}
