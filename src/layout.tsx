import ReactDOM from "react-dom/client";
import "./styles/index.css";
import "./styles/audio.css";
import { Index } from "./app/Index";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@mui/material";
import { useState } from "react";

function PlayButtonScreenProvider() {
  const [b, setBoolean] = useState<boolean>(false);

  if (b === false) {
    return (
      <main>
        <table className="instructions">
          <tr>
            {" "}
            <th>keyboard key</th> <th>gamepad key</th> <th>action</th>{" "}
          </tr>
          <tr>
            {" "}
            <td> W / S </td> <td>A / B / 0 / 1 </td> <td>Accelerating </td>{" "}
          </tr>
          <tr>
            {" "}
            <td> A / D </td>{" "}
            <td>Right Axis X Axis / Npad Right / Npad Left </td>
            <td>Sterring Wheel </td>{" "}
          </tr>
          <tr>
            {" "}
            <td> Space </td> <td>R1 </td> <td>Drift </td>{" "}
          </tr>
          <tr>
            {" "}
            <td> Mouse Right </td> <td>L1 </td> <td>Show Scoreboard </td>{" "}
          </tr>
          <tr>
            {" "}
            <td> Mouse Left </td> <td>X / Y / 2 / 3 / L2 / R2 </td>{" "}
            <td>Use Special </td>{" "}
          </tr>
          <tr>
            {" "}
            <td> Escape </td> <td>Start </td> <td>Unlock / Pause Menu </td>{" "}
          </tr>
        </table>
        <br />
        <br />
        <center>
          <Button
            className="r"
            onClick={() => {
              setBoolean(true);
            }}
          >
            Play
          </Button>
        </center>
      </main>
    );
  }
  return <Index />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <PlayButtonScreenProvider />
);
