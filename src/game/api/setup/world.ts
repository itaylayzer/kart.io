import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import { Socket } from "socket.io-client";
import * as THREE from "three";
import {
  EffectComposer,
  OutputPass,
  PointerLockControls,
  RenderPass,
  ShaderPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import { colors } from "../../constants";
import { CameraController } from "../../controller/CameraController";
import { MouseController } from "../../controller/MouseController";
import { LocalPlayer } from "../../player/LocalPlayer";
import { OnlinePlayer } from "../../player/OnlinePlayer";
import { Player } from "../../player/Player";
import { CC, CS } from "../../store/codes";
import { Global } from "../../store/Global";
import { MysteryBox } from "../meshes/MysteryBox";
import {
  createFences,
  createRoad,
  createFencesPilars,
  createVectorsFromNumbers,
  createWater,
  createStarfield,
} from "./road";
import msgpack from "msgpack-lite";
import { curvePoints } from "../../constants/road";
import { PauseMenu } from "../../player/PauseMenu";
import { AudioController } from "../../controller/AudioController";
import Stats from "three/examples/jsm/libs/stats.module.js";

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
  Global.lateUpdates = [];
  new PauseMenu();
}

function setupScene() {
  Global.container = document.querySelector("div.gameContainer")!;

  Global.renderer = new THREE.WebGLRenderer({
    antialias: Global.settings.Antialiasing,
  });
  Global.container.appendChild(Global.renderer.domElement);
  // Global.renderer.sortObjects = false;
  // Global.renderer.shadowMapEnabled = true;
  // Global.renderer.shadowMapType = THREE.PCFShadowMap;
  Global.renderer.setSize(
    Global.container.clientWidth,
    Global.container.clientHeight
  );
  Global.renderer.shadowMap.enabled = true;
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
}

function setupRoad() {
  const pts: THREE.Vector3[] = createVectorsFromNumbers(curvePoints[0]);
  Global.curve = new THREE.CatmullRomCurve3(pts);
  const roadsSegments = createRoad(Global.curve, 5, 200, 2000);
  Global.lod.add(...roadsSegments);
  Global.roadMesh = roadsSegments;

  if (Global.settings.displayStars) {
    const points = createStarfield(1000, 500);
    Global.lod.add(points);
  }
  if (Global.settings.displayFences) {
    const fences = createFences(Global.curve, 5, 100, 1400);
    Global.lod.add(...fences);
    Global.optimizedObjects.push(...fences);
  }

  if (Global.settings.displayPillars) {
    const tiles = createFencesPilars(
      Global.curve,
      5.1,
      100,
      1400,
      roadsSegments
    );
    Global.lod.add(...tiles);
    Global.optimizedObjects.push(...tiles);
  }

  const texture = Global.assets.textures.block.clone();
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.offset.set(0, 0);
  texture.repeat.setX(10);
  texture.repeat.setY(2);

  const flagBlock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 10), [
    new THREE.MeshPhongMaterial({ color: "white", map: texture }),
    new THREE.MeshPhongMaterial({ color: "white", map: texture }),
    new THREE.MeshPhongMaterial({ color: "#1a1a1a" }),
    new THREE.MeshPhongMaterial({ color: "#1a1a1a" }),
    new THREE.MeshPhongMaterial({ color: "#1a1a1a" }),
    new THREE.MeshPhongMaterial({ color: "#1a1a1a" }),
  ]);
  const flagPos = Global.curve.getPoints(700)[1];
  flagBlock.position.copy(flagPos).add(new THREE.Vector3(0, 2, 0));

  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 3, 10, 10),
    new THREE.MeshPhongMaterial({ color: "#1a1a1a" })
  );
  rod.position
    .copy(flagPos)
    .add(new THREE.Vector3(0, 1.5, 0))
    .add(new THREE.Vector3(0, 0, 5).applyQuaternion(flagBlock.quaternion));
  const crod = rod.clone();
  Global.lod.add(flagBlock);
  Global.lod.add(crod);
  rod.position
    .copy(flagPos)
    .add(new THREE.Vector3(0, 1.5, 0))
    .add(new THREE.Vector3(0, 0, -5).applyQuaternion(flagBlock.quaternion));
  Global.lod.add(rod);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(25, 5, 5),
    new THREE.MeshPhongMaterial({
      color: "#f56505",
      emissive: "#f56505",
      emissiveIntensity: 150,
      fog: false,
      opacity: 0.3,
      transparent: true,
    })
  );
  sun.position.set(500, 150, 500);

  if (Global.settings.displaySun) Global.lod.add(sun);

  Global.optimizedObjects.push(...Global.roadMesh, rod, crod);
}

function setupSocket(
  socket: Socket,
  localID: number,
  players: Map<number, [string, number, boolean]>
) {
  Global.socket = socket;

  for (const [playerID, playerInfo] of players.entries()) {
    if (localID === playerID)
      new LocalPlayer(playerID, playerInfo[0], playerInfo[1]);
    else new OnlinePlayer(playerID, playerInfo[0], playerInfo[1]);
  }

  Global.socket.on(
    CC.INIT_GAME,
    ([playerTransforms, mysteryBoxLocations]: [
      [number, number[]][],
      number[]
    ]) => {
      for (const [playerID, ptTransform] of playerTransforms) {
        const xplayer = Player.clients.get(playerID);
        if (xplayer === undefined) continue;
        xplayer.applyTransform(ptTransform);
        xplayer.tracker.reset();
      }
      AudioController.init();

      const pts = createVectorsFromNumbers(mysteryBoxLocations);
      for (const [id, p] of pts.entries()) {
        new MysteryBox(id, new CANNON.Vec3(p.x, p.y, p.z));
      }
    }
  );

  Global.socket?.on(CC.KEY_DOWN, (args: { pid: number; buffer: Buffer }) => {
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

  Global.socket?.on(CC.KEY_UP, (args: { pid: number; buffer: Buffer }) => {
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

  Global.socket?.on(CC.DISCONNECTED, (disconnectedID) => {
    OnlinePlayer.clients.get(disconnectedID)?.disconnect();
  });

  Global.socket?.on(
    CC.MYSTERY_VISIBLE,
    ([id, isVisible]: [number, boolean]) => {
      MysteryBox.toggleMystery(id, isVisible);
    }
  );
  Global.socket?.on("disconnect", () => {
    Global.socket = undefined;
  });

  Global.socket.emit(CS.INIT_GAME);
  window.addEventListener("beforeunload", () => {
    Global.socket?.disconnect();
  });
  window.addEventListener("unload", () => {
    Global.socket?.disconnect();
  });
}

function setupRenderer() {
  const composer = new EffectComposer(Global.renderer);
  composer.addPass(new RenderPass(Global.scene, Global.camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 1;
  bloomPass.strength = 0.5;
  bloomPass.radius = 0;

  const composer2 = new EffectComposer(Global.renderer);
  composer2.addPass(new RenderPass(Global.scene, Global.camera));
  composer2.addPass(new OutputPass());

  const shader = {
    uniforms: {
      tDiffuse: { type: "t", value: null },
      tColor: { type: "t", value: null },
      resolution: { type: "v2", value: new THREE.Vector2(1, 1) },
      viewProjectionInverseMatrix: { type: "m4", value: new THREE.Matrix4() },
      previousViewProjectionMatrix: { type: "m4", value: new THREE.Matrix4() },
      velocityFactor: { type: "f", value: 1 },
    },

    vertexShader: document.getElementById("vs-motionBlur")!.textContent,
    fragmentShader: document.getElementById("fs-motionBlur")!.textContent,
  };

  const blurPass = new ShaderPass(shader);
  blurPass.renderToScreen = true;
  if (Global.settings.useBloom) composer.addPass(bloomPass);
  // composer.addPass(fastPass);

  window.addEventListener("resize", () => {
    const s = 1;
    composer.setSize(s * window.innerWidth, s * window.innerHeight);
    composer2.setSize(s * window.innerWidth, s * window.innerHeight);
    Global.camera.aspect = window.innerWidth / window.innerHeight;
    Global.camera.updateProjectionMatrix();

    Global.renderer.setSize(s * window.innerWidth, s * window.innerHeight);
    blurPass.uniforms.resolution.value.set(
      s * window.innerWidth,
      s * window.innerHeight
    );
  });

  var mCurrent = new THREE.Matrix4();
  var mPrev = new THREE.Matrix4();
  var tmpArray = new THREE.Matrix4();

  let beforeUpdate = () => {};
  if (Global.settings.displayWater) {
    const [waterGround, _beforeUpdate] = createWater(500, 500, 10, 10);
    for (const water of waterGround) {
      water.position.y -= 1;
    }
    beforeUpdate = _beforeUpdate;
    Global.lod.add(...waterGround);
  }

  Global.render = () => {
    beforeUpdate();
    blurPass.material.uniforms.velocityFactor.value = 4;

    tmpArray.copy(Global.camera.matrixWorldInverse);
    tmpArray.multiply(Global.camera.projectionMatrix);
    mCurrent.copy(tmpArray.clone().invert());

    blurPass.material.uniforms.viewProjectionInverseMatrix.value.copy(mCurrent);
    blurPass.material.uniforms.previousViewProjectionMatrix.value.copy(mPrev);

    composer2.render();

    blurPass.material.uniforms.tDiffuse.value = composer2.renderTarget2;
    composer.render();

    mPrev.copy(tmpArray);
  };
}

function setupSTATS() {
  if (Global.settings.useSTATS) {
    document.body.appendChild((Global.stats = new Stats()).dom);
  }
}

export default function (
  socket: Socket,
  pid: number,
  players: Map<number, [string, number, boolean]>
) {
  Global.optimizedObjects = [];
  setupScene();
  setupPhysicsWorld();
  setupLights();
  setupRoad();
  setupObjects();

  setupControllers();
  setupWindowEvents();
  setupRenderer();

  setupSTATS();

  requestAnimationFrame(() => setupSocket(socket, pid, players));
}
