import AssetLoader from "../components/AssetLoader";
import { useStyles } from "../hooks/useStyles";
import { usePlayScreen } from "../viewmodels";

function Play({ room, name }: { room: number; name: string }) {
  usePlayScreen(room, name);

  return (
    <>
      <div style={styles.gameContainer} className="gameContainer"></div>

      <p id="wrong" style={styles.wrong}>
        YOUR FACING THE WRONG DIRECTION
      </p>
      <p id="position" style={styles.position}>
        0
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

  position: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "#050505",
    margin: 0,
    color: "white",
    fontFamily: "New Super Mario Font U",
    padding: "4px 16px",
    borderRadius: "4px",
    fontSize: 20,
  },
  map: {
    position: "absolute",
    top: "50%",
    translate: "0% -50%",
    right: 10,
    aspectRatio: 1,
    width: 250,
    zIndex: 3,
    pointerEvents: "none",
  },
  wrong: {
    position: "absolute",
    top: 20,
    left: "50%",
    translate: "-50% 0%",
    backgroundColor: "#111",
    margin: 0,
    color: "white",
    fontFamily: "New Super Mario Font U",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: 25,
  },
});

export default ({ room, name }: { room: number; name: string }) => (
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
    <Play name={name} room={room} />
  </AssetLoader>
);
