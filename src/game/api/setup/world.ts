import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import { io } from "socket.io-client";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { colors } from "../../constants";
import { CameraController } from "../../controller/CameraController";
import { MouseController } from "../../controller/MouseController";
import { LocalPlayer } from "../../player/LocalPlayer";
import { OnlinePlayer } from "../../player/OnlinePlayer";
import { Player } from "../../player/Player";
import { CC, CS } from "../../store/codes";
import { Global } from "../../store/Global";
import { MysteryBox } from "../meshes/MysteryBox";
import { createRoad, createVectorsFromNumbers } from "./road";
import msgpack from "msgpack-lite";
import { getNameFromURL } from "../getNameFromURL";
import { curvePoints } from "../../constants/road";

function setupLights() {
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  hemiLight.color = new THREE.Color("#ffffff");
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  Global.scene.add(hemiLight);

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
}

function setupObjects() {
  Global.updates = [];
}

function setupScene() {
  Global.container = document.querySelector("div.gameContainer")!;
  Global.renderer = new THREE.WebGLRenderer({ antialias: true });
  Global.renderer.setSize(
    Global.container.clientWidth,
    Global.container.clientHeight
  );
  Global.renderer.shadowMap.enabled = true;
  Global.container.appendChild(Global.renderer.domElement);
  Global.scene = new THREE.Scene();
  Global.scene.background = new THREE.Color(colors.background);
  Global.scene.fog = new THREE.Fog(Global.scene.background, 10, 20);

  Global.lod = new THREE.LOD();
  Global.scene.add(Global.lod);
}
function setupPhysicsWorld() {
  Global.world = new CANNON.World();
  Global.world.gravity = new CANNON.Vec3(0, 0, 0);
  Global.world.allowSleep = true;
  Global.world.broadphase = new CANNON.SAPBroadphase(Global.world);
}

function setupControllers() {
  Global.cannonDebugger = CannonDebugger(Global.scene, Global.world, {});
  Global.camera = new THREE.PerspectiveCamera(
    90,
    Global.container.clientWidth / Global.container.clientHeight,
    0.001,
    1000
  );
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
  const [dotsM, m] = createRoad(curvePoints, 15, 0);

  Global.roadMesh = m;
  Global.scene.add(dotsM);
  Global.scene.add(m);
}

function setupSocket() {
  Global.socket = io({ hostname: "127.0.0.1", secure: false, port: 3000 });
  Global.socket.on(
    CC.INIT,
    ([id, transform, players, locations]: [
      number,
      number[],
      { name: string; pid: number; transform: number[] }[],
      number[]
    ]) => {
      new LocalPlayer(id).applyTransform(transform);

      for (const { pid, name, transform: ptransform } of players) {
        new OnlinePlayer(pid, name).applyTransform(ptransform);
      }

      const pts = createVectorsFromNumbers(locations);
      console.log(pts);
      for (const [id, pt] of pts.entries()) {
        new MysteryBox(id, new CANNON.Vec3(pt.x, pt.y, pt.z));
      }
    }
  );

  Global.socket.on(CC.KEY_DOWN, (args: { pid: number; buffer: Buffer }) => {
    const xplayer = Player.clients.get(args.pid);

    const [key, ...data] = msgpack.decode(
      new Uint8Array(args.buffer)
    ) as number[];
    if (data.length) {
      const [x, y, z, rx, ry, rz, rw] = data;
      xplayer?.position.set(x, y, z);
      xplayer?.quaternion.set(rx, ry, rz, rw);
    }
    xplayer?.keyboard.keysDown.add(key);
  });

  Global.socket.on(CC.KEY_UP, (args: { pid: number; buffer: Buffer }) => {
    const xplayer = Player.clients.get(args.pid);
    const [key, ...data] = msgpack.decode(
      new Uint8Array(args.buffer)
    ) as number[];
    if (data.length) {
      const [x, y, z, rx, ry, rz, rw] = data;
      xplayer?.position.set(x, y, z);
      xplayer?.quaternion.set(rx, ry, rz, rw);
    }
    xplayer?.keyboard.keysUp.add(key);
    xplayer?.keyboard.keysPressed.delete(key);
  });

  Global.socket.on(
    CC.NEW_PLAYER,
    (xplayer: { name: string; pid: number; transform: number[] }) => {
      new OnlinePlayer(xplayer.pid, xplayer.name).applyTransform(
        xplayer.transform
      );
    }
  );

  Global.socket.on(CC.DISCONNECTED, (disconnectedID) => {
    OnlinePlayer.clients.get(disconnectedID)?.disconnect();
  });

  Global.socket.on("connect", () => {
    Global.socket!.emit(CS.JOIN, getNameFromURL());
  });

  Global.socket.on(CC.MYSTERY_VISIBLE, ([id, isVisible]: [number, boolean]) => {
    MysteryBox.toggleMystery(id, isVisible);
  });
  Global.socket.on("disconnect", () => {
    Global.socket = undefined;
  });

  window.addEventListener("beforeunload", () => {
    Global.socket?.disconnect();
  });
}

export default function () {
  setupScene();
  setupPhysicsWorld();
  setupLights();
  setupObjects();
  setupControllers();
  setupWindowEvents();
  setupStats();
  setupRoad();
  setupSocket();
}
