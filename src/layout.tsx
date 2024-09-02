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
        <Button
          className="r"
          onClick={() => {
            setBoolean(true);
          }}
        >
          Play
        </Button>
      </main>
    );
  }
  return <Index />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <PlayButtonScreenProvider />
);
