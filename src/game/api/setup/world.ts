// import { BoxObject } from "../meshes/BoxObject";
import { Global } from "../../store/Global";
// import { createLight } from "../../api/createLights";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { colors } from "../../constants";
import { KeyboardController } from "../../controller/KeyboardController";
import { MouseController } from "../../controller/MouseController";
import { CameraController } from "../../controller/CameraController";
import CannonDebugger from "cannon-es-debugger";
import Stats from "three/examples/jsm/libs/stats.module.js";
// import CannonUtils from "cannon-utils";
// import { HighlightedArea } from "../meshes/HighiltedArea";
import { PointerLockControls } from "three/examples/jsm/Addons.js";
import { LocalPlayer } from "../../player/LocalPlayer";
import { createRoad } from "./road2";
import { io } from "socket.io-client";
import { CC, CS } from "../../store/codes";
import { OnlinePlayer } from "../../player/OnlinePlayer";
import { MysteryBox } from "../meshes/MysteryBox";
import { Player } from "../../player/Player";
import { getNameFromURL } from "../getNameFromURL";
import msgpack from "msgpack-lite";

function setupLights() {
  // createLight(
  //     [
  //         {
  //             color: 0xffffff,
  //             intensity: 0.5,
  //             type: "directional",
  //             rot: new THREE.Euler(Math.PI / 3, 0, 0),
  //             pos: new THREE.Vector3(0, 2, 0),
  //         },
  //         {
  //             color: 0xffffff,
  //             intensity: 0.7,
  //             type: "ambient",
  //             rot: new THREE.Euler(0.9, 0.5, 0),
  //         },
  //     ],
  //     Global.scene
  // );

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  hemiLight.color = new THREE.Color("#ffffff");
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  Global.scene.add(hemiLight);

  // const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
  // Global.scene.add(hemiLightHelper);

  //

  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.color = new THREE.Color("#ffffff");
  dirLight.position.set(-1, 1.75, 1);
  dirLight.position.multiplyScalar(30);
  Global.scene.add(dirLight);

  dirLight.castShadow = true;

  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.blurSamples = 1;

  const d = 50;

  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;

  dirLight.shadow.camera.far = 3500;
  dirLight.shadow.camera.near = 0;
  dirLight.shadow.bias = -0.0001;

  // const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
  // Global.scene.add(dirLightHelper);
}

function setupObjects() {
  Global.updates = [];

  // new Platform(70, 1, 100, new CANNON.Vec3(0, -1, 0));
}

function setupScene() {
  Global.container = document.querySelector("div.gameContainer")!;
  Global.renderer = new THREE.WebGLRenderer({ antialias: true });
  Global.renderer.setSize(
    Global.container.clientWidth,
    Global.container.clientHeight
  );
  Global.renderer.shadowMap.enabled = true;
  // Global.renderer.shadowMap.;
  Global.container.appendChild(Global.renderer.domElement);
  Global.scene = new THREE.Scene();
  Global.scene.background = new THREE.Color(colors.background);
  Global.scene.fog = new THREE.Fog(Global.scene.background, 10, 20);
}

function setupControllers() {
  // @ts-ignore
  Global.cannonDebugger = CannonDebugger(Global.scene, Global.world, {});
  Global.camera = new THREE.PerspectiveCamera(
    90,
    Global.container.clientWidth / Global.container.clientHeight,
    0.001,
    1000
  );
  Global.keyboardController = new KeyboardController();
  Global.mouseController = new MouseController();
  Global.cameraController = new CameraController(Global.camera);
  Global.lockController = new PointerLockControls(
    Global.camera,
    Global.renderer.domElement
  );
}

function setupWindowEvents() {
  Global.container.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  window.addEventListener("resize", () => {
    Global.camera.aspect = window.innerWidth / window.innerHeight;
    Global.camera.updateProjectionMatrix();

    Global.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function setupStats() {
  Global.stats = new Stats();
  document.body.appendChild(Global.stats.dom);
}

function setupRoad() {
  const curvePoints = [
    -6, 0, 10, -1, 0, 10, 3, 0, 4, 6, 0, 1, 11, 0, 2, 13, 0, 6, 9, 1, 9, 4, 1,
    7, 1, 1, 1, 0, 1, -5, 2, 0, -9, 8, 0, -10, 13, 0, -5, 14, 1, 2, 10, 3, 7, 2,
    1, 8, -4, 3, 7, -8, 1, 1, -9, 1, -4, -6, 1, -9, 0, 1, -10, 7, 1, -7, 5, 2,
    0, 0, 2, 2, -5, 1, 0, -7, 2, -5, -8, 2, -9, -11, 2, -10, -14, 1, -7, -13, 1,
    -2, -14, 0, 3, -11, 0, 10, -6, 0, 10,
  ].map((v) => v * 10);

  const [dotsM, m] = createRoad(curvePoints, 15, 0);

  // Global.world.addBody(
  //   new CANNON.Body({
  //     shape: s,
  //     mass: 0,
  //     material: new CANNON.Material({ friction: 0, restitution: 0 }),
  //     collisionFilterGroup: 2,
  //   })
  // );
  Global.roadMesh = m;
  Global.scene.add(dotsM);
  Global.scene.add(m);
}

function setupSocket() {
  Global.socket = io({ hostname: "127.0.0.1", secure: false, port: 3000 });
  Global.socket.on(
    CC.INIT,
    ([pid, players]: [number, { name: string; id: number }[]]) => {
      Global.localPlayer = new LocalPlayer(pid);
      console.log(players);
      for (const { id, name } of players) {
        new OnlinePlayer(id, name);
      }
    }
  );

  Global.socket.on(CC.NEW_PLAYER, (xplayer: { name: string; id: number }) => {
    new OnlinePlayer(xplayer.id, xplayer.name);
  });

  Global.socket.on(CC.UPDATE, (obj: Buffer) => {
    const data = msgpack.decode(new Uint8Array(obj));
    const xplayer = Player.clients.get(data[0]);
    if (xplayer === undefined) return;
    xplayer.update(
      new THREE.Vector3(data[1], data[2], data[3]),
      new THREE.Quaternion(data[4], data[5], data[6], data[7]),
      new THREE.Vector3(data[8], data[9], data[10]),
      data[11]
    );
  });

  Global.socket.on(CC.DISCONNECTED, (disconnectedID) => {
    OnlinePlayer.clients.get(disconnectedID)?.disconnect();
  });

  Global.socket.on("connect", () => {
    Global.socket!.emit(CS.JOIN, getNameFromURL());
  });
  Global.socket.on("disconnect", () => {
    Global.socket = undefined;
  });

  window.addEventListener("beforeunload", () => {
    Global.socket?.disconnect();
  });

  // new MysteryBox(new CANNON.Vec3(28, 0.4, 42));
  // new MysteryBox(new CANNON.Vec3(29, 0.4, 42));
  // new MysteryBox(new CANNON.Vec3(30, 0.4, 42));
  // new MysteryBox(new CANNON.Vec3(31, 0.4, 42));
  // new MysteryBox(new CANNON.Vec3(27, 0.4, 42));
}

export default function () {
  setupScene();
  setupLights();
  setupObjects();
  setupControllers();
  setupWindowEvents();
  setupStats();
  setupRoad();
  setupSocket();
}
