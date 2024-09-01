import { useSettingsScreen } from "../viewmodels/useSettingsScreen";
import Slider from "@mui/material/Slider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
export function Settings({ goBack }: { goBack: () => void }) {
  const {
    loadFromCookies,
    saveToCookies,
    reset,
    set,
    useArrow,
    fovChange,
    masterVolume,
  } = useSettingsScreen();

  return (
    <main>
      <h1 style={{ fontSize: 60 }}>Settings</h1>
      <table id="settings">
        <tr>
          <td>Display Players</td>{" "}
          <td>
            <Select
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
              min={0}
              step={0.01}
              max={1}
              style={{ width: 150 }}
              value={fovChange}
              onChange={(_, value) => set({ fovChange: value as number })}
            />
            <p style={{ fontFamily: "monospace" }}>{fovChange.toFixed(2)}</p>
          </td>
        </tr>
        <tr>
          <td>Master Volume</td>{" "}
          <td style={{ display: "flex", gap: 20 }}>
            <Slider
              min={0}
              step={0.01}
              max={1}
              style={{ width: 150 }}
              value={masterVolume}
              onChange={(_, value) => set({ masterVolume: value as number })}
            />
            <p style={{ fontFamily: "monospace" }}>{masterVolume.toFixed(2)}</p>
          </td>
        </tr>
      </table>
      <br />
      <br />
      <button onClick={() => goBack()}>Back</button>
      <button onClick={() => loadFromCookies()}>Load</button>
      <button onClick={() => saveToCookies()}>Save</button>
      <button onClick={() => reset()}>Reset</button>
    </main>
  );
}
