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
import Dat from "dat.gui";
import init from "three-dat.gui";
import { createRoad } from "./road2";
import { io } from "socket.io-client";
import { CC } from "../../store/codes";
import { OnlinePlayer } from "../../player/OnlinePlayer";
init(Dat);

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
    Global.scene.fog = new THREE.Fog(Global.scene.background, 10, 30);
}

function setupPhysicsWorld() {
    Global.world = new CANNON.World();
    Global.world.gravity = new CANNON.Vec3(0, 0, 0);
    Global.world.allowSleep = true;
    Global.world.broadphase = new CANNON.SAPBroadphase(Global.world);
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

function setupDat() {
    const gui = new Dat.GUI();

    const obj = {
        "master volume": 0.5,
        "max speed": 7.5,
    };

    gui.add(obj, "max speed", 0, 20, 2.5).onFinishChange(() => {
        LocalPlayer.getInstance().setMaxSpeed(obj["max speed"]);
    });
}

function setupRoad() {
    const curvePoints = [
        -6, 0, 10, -1, 0, 10, 3, 0, 4, 6, 0, 1, 11, 0, 2, 13, 0, 6, 9, 1, 9, 4,
        1, 7, 1, 1, 1, 0, 1, -5, 2, 0, -9, 8, 0, -10, 13, 0, -5, 14, 1, 2, 10,
        3, 7, 2, 1, 8, -4, 3, 7, -8, 1, 1, -9, 1, -4, -6, 1, -9, 0, 1, -10, 7,
        1, -7, 5, 2, 0, 0, 2, 2, -5, 1, 0, -7, 2, -5, -8, 2, -9, -11, 2, -10,
        -14, 1, -7, -13, 1, -2, -14, 0, 3, -11, 0, 10, -6, 0, 10,
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
    Global.socket.on(CC.INIT, (players: Record<"name" | "id", string>[]) => {
        for (const { id, name } of players) {
            new OnlinePlayer(id, name);
        }
    });

    Global.socket.on(
        CC.NEW_PLAYER,
        (xplayer: Record<"name" | "id", string>) => {
            new OnlinePlayer(xplayer.id, xplayer.name);
        }
    );
    Global.socket.on(
        CC.UPDATE,
        (obj: {
            id: string;
            position: THREE.Vector3Like;
            quaternion: number[];
            velocity: number;
            horizontal: number;
        }) => {
            const xplayer = OnlinePlayer.clients.get(obj.id);
            if (xplayer === undefined) return;
            xplayer.update(
                new THREE.Vector3().copy(obj.position),
                new THREE.Quaternion(
                    obj.quaternion[0],
                    obj.quaternion[1],
                    obj.quaternion[2],
                    obj.quaternion[3]
                ),
                obj.velocity,
                obj.horizontal
            );
        }
    );

    Global.socket.on(CC.DISCONNECTED, (disconnectedID) => {
        const xplayer = OnlinePlayer.clients.get(disconnectedID);
        if (xplayer === undefined) return;
        xplayer.disconnect();
    });

    Global.socket.on("connect", () => {
        LocalPlayer.getInstance().register();
    });
    Global.socket.on("disconnect", () => {
        Global.socket = undefined;
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
    Global.localPlayer = new LocalPlayer();
    setupDat();
}
