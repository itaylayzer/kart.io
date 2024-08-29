import AssetLoader from "../components/AssetLoader";
import { useStyles } from "../hooks/useStyles";
import { useApScreens } from "../viewmodels";

function App() {
  useApScreens();

  return (
    <>
      <div style={styles.gameContainer} className="gameContainer"></div>

      <p id="velocity" style={styles.velocity}>
        0.00 KM/S
      </p>
      <canvas id="map" width={500} height={500} style={styles.map} />
    </>
  );
}

const styles = useStyles({
  gameContainer: {
    display: "block",
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
  },

  velocity: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    translate: "-50% 0%",
    backgroundColor: "red",
    margin: 0,
    color: "white",
    fontFamily: "monospace",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: 15,
  },
  map: {
    position: "absolute",
    top: 10,
    right: 10,
    aspectRatio: 1,
    width: 250,
    zIndex: 3,
    pointerEvents: "none",
  },
});

export default () => (
  <AssetLoader
    items={{
      car: "fbx/kart.glb",
      // sfx_throw:"https://soxundbible.com/mp3/kung_fu_punch-Mike_Koenig-2097967259.mp3"
      sfx_throw: "sfx/throw.mp3",
      sfx_exp: "sfx/exp.mp3",
      sfx_shoot: "sfx/shoot.mp3",
      txt_circle: "textures/circle.png",
      txt_road: "textures/CentralMarking.png",
      mystery: "textures/mystery.png",
    }}
  >
    <App />
  </AssetLoader>
);
