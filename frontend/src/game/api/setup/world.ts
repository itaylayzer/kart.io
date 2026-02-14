import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import msgpack from "msgpack-lite";
import * as THREE from "three";
import {
    BlendShader,
    CopyShader,
    EffectComposer,
    PointerLockControls,
    RenderPass,
    SavePass,
    ShaderPass,
    UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { colors, FOG } from "../../constants";
import { AudioController } from "../../controller/AudioController";
import { CameraController } from "../../controller/CameraController";
import { MouseController } from "../../controller/MouseController";
import { LocalPlayer } from "../../player/LocalPlayer";
import { OnlinePlayer } from "../../player/OnlinePlayer";
import { PauseMenu } from "../../player/PauseMenu";
import { Player } from "../../player/Player";
import { CC, CS } from "../../store/codes";
import { Global } from "../../store/Global";
import { MysteryBox } from "../meshes/MysteryBox";
import {
    createFences,
    createFencesPilars,
    createRoad,
    createStarfield,
    createVectorsFromNumbers,
    createWater,
} from "./road";
import { Banana } from "../../player/Items/Banana";
import { Wheels } from "../../player/Items/Wheel";
import { TrackerController } from "../../controller/TrackerController";
import { Scoreboard } from "../../player/Scoreboard";
import { StartTimer } from "../../player/StartTimer";
import { KartClient } from "@/types/KartClient";
import { getStateCallbacks } from "colyseus.js";
import type { StatePayload } from "@shared/types/payloads";
import { makeAutoLOD } from "../autoLLD";

const isValidPosition = (x: number, y: number, z: number) =>
    Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) &&
    Math.abs(x) < 1e4 && Math.abs(y) < 1e4 && Math.abs(z) < 1e4;

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
    Player.clients.clear();
    TrackerController.FINALS = [];
}

function setupScene() {
    Global.container = document.querySelector("div.gameContainer")!;

    Global.renderer = new THREE.WebGLRenderer({
        antialias: Global.settings.Antialiasing,
    });
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

    Global.scene.fog = new THREE.Fog(Global.scene.background, FOG[3][1], FOG[3][2]);
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

const add = (object: THREE.Mesh) => makeAutoLOD(object, Global.scene, [0, 50, 120], [1.0, 0.35, 0.08]);;
function setupRoad() {
    const fullRoadsSegments = createRoad(Global.curve, 5, 50, 3000);
    const lowRoadsSegments = createRoad(Global.curve, 5, 50, 100);
    const midRoadsSegments = createRoad(Global.curve, 5, 50, 500);

    const SIZE = lowRoadsSegments.length;
    for (let i = 0; i < SIZE; i++) {
        const lod = new THREE.LOD();

        lod.addLevel(midRoadsSegments[i], 0);
        lod.addLevel(lowRoadsSegments[i], 50);

        lod.position.copy(midRoadsSegments[i].getWorldPosition(new THREE.Vector3()));
        midRoadsSegments[i].position.sub(lod.position);
        lowRoadsSegments[i].position.sub(lod.position);
        Global.scene.add(lod);
        Global.unoptimizedObjects.push(lod);
    }

    Global.roadMesh = fullRoadsSegments;
    Global.scene.add(...fullRoadsSegments);
    Global.optimizedObjects.push(...Global.roadMesh);

    if (Global.settings.displayStars) {
        const points = createStarfield(1000, 50);
        Global.scene.add(points);
    }
    if (Global.settings.displayFences) {
        const fences = createFences(Global.curve, 5, 100, 1400);
        fences.forEach((f) => add(f))
    }

    if (Global.settings.displayPillars) {
        setTimeout(() => {
            const tiles = createFencesPilars(
                Global.curve,
                5.1,
                100,
                1400,
                fullRoadsSegments
            );
           
            for (let i = 0; i < tiles.length; i++) {
                Global.scene.add(tiles[i]);
            }

            tiles.forEach((f) => add(f));
        }, 100);
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
    Global.scene.add(flagBlock);
    add(crod);
    rod.position
        .copy(flagPos)
        .add(new THREE.Vector3(0, 1.5, 0))
        .add(new THREE.Vector3(0, 0, -5).applyQuaternion(flagBlock.quaternion));
    add(rod);

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

    if (Global.settings.displaySun) add(sun);

}

function setupSocket(
    client: KartClient,
    localID: number,
    players: Map<number, [string, number, boolean]>,
    gameStartTime: number = 0
) {
    Global.client = client;

    for (const [playerID, playerInfo] of players.entries()) {
        if (localID === playerID)
            new LocalPlayer(playerID, playerInfo[0], playerInfo[1]);
        else new OnlinePlayer(playerID, playerInfo[0], playerInfo[1]);
    }

    const $ = getStateCallbacks(client);

    $(client.state).mysteries.onChange((mystery, index) => {
        MysteryBox.toggleMystery(index, mystery.visible);
    })

    StartTimer.start(gameStartTime || client.state.startTime);


    requestAnimationFrame(() => {
        Global.container.appendChild(Global.renderer.domElement);
        Global.lockController.lock();
    });

    client.state.mysteries.forEach(({ position: { x, y, z } }, id) => {
        new MysteryBox(id, new CANNON.Vec3(x, y, z));
    })

    // Set kart positions immediately so they're on the track before first physics step
    // (100ms delay caused karts to float - they started at pid*10,pid*10,pid*10)
    client.state.players.forEach(({ color, startTransform }) => {
        const xplayer = Player.clients.get(color);
        if (xplayer === undefined) return;

        const { x, y, z } = startTransform.position;
        const { x: qx, y: qy, z: qz, w: qw } = startTransform.quaternion;
        xplayer.position.set(x, y, z);
        xplayer.quaternion.set(qx, qy, qz, qw);
        xplayer.velocity.setZero();
        xplayer.force.setZero();
        xplayer.tracker.reset();
    });

    AudioController.init();

    client.onMessage(CC.MYSTERY_ITEM, (itemIndex: number) => {
        LocalPlayer.getInstance().items.setItem(itemIndex);
    })

    Global.client.onMessage(CC.KEY_DOWN, (args: { pid: number; buffer: Buffer }) => {
        const xplayer = Player.clients.get(args.pid);

        const [key, ...data] = msgpack.decode(
            new Uint8Array(args.buffer)
        ) as number[];
        if (data.length && xplayer) {
            const [x, y, z, rx, ry, rz, rw] = data;
            if (isValidPosition(x, y, z)) {
                xplayer.position.set(x, y, z);
                xplayer.quaternion.set(rx, ry, rz, rw);
            }
        }
        xplayer?.keyboard.keysDown.add(key);
    });

    Global.client.onMessage(CC.UPDATE_TRANSFORM, (buffer: Buffer) => {
        const [pid, ...data] = msgpack.decode(
            new Uint8Array(buffer)
        ) as number[];
        const xplayer = Player.clients.get(pid);
        if (xplayer && data.length >= 7) {
            const [x, y, z, rx, ry, rz, rw] = data;
            if (isValidPosition(x, y, z)) {
                xplayer.position.set(x, y, z);
                xplayer.quaternion.set(rx, ry, rz, rw);
            }
        }
    });

    Global.client.onMessage(CC.FINISH_LINE, (pid: number) => {
        TrackerController.FINALS.push(pid);
    });

    Global.client.onMessage(CC.STATE_BUFFER, (state: StatePayload) => {
        const local = LocalPlayer.getInstance();
        if (!isValidPosition(state.position.x, state.position.y, state.position.z)) return;
        local.position.set(state.position.x, state.position.y, state.position.z);
        local.quaternion.set(
            state.quaternion.x,
            state.quaternion.y,
            state.quaternion.z,
            state.quaternion.w
        );
        local.velocity.set(state.velocity.x, state.velocity.y, state.velocity.z);
        local.turboMode = state.turboMode;
        local.rocketMode = state.rocketMode;
        local.driftSide = state.driftSide;
        local.mushroomAddon = state.mushroomAddon;
    });

    Global.client.onMessage(
        CC.POSITION_UPDATE,
        (payload: {
            pid: number;
            position: { x: number; y: number; z: number };
            quaternion: { x: number; y: number; z: number; w: number };
        }) => {
            const xplayer = Player.clients.get(payload.pid);
            if (xplayer && isValidPosition(payload.position.x, payload.position.y, payload.position.z)) {
                xplayer.position.set(
                    payload.position.x,
                    payload.position.y,
                    payload.position.z
                );
                xplayer.quaternion.set(
                    payload.quaternion.x,
                    payload.quaternion.y,
                    payload.quaternion.z,
                    payload.quaternion.w
                );
            }
        }
    );

    Scoreboard.finishMacth = false;
    Global.client.onMessage(CC.SHOW_WINNERS, () => {
        // TODO: SHOW NEXT SCREEN
        Scoreboard.finishMacth = true;
        Global.lockController.unlock();
        console.warn("finished");
    });

    Global.client.onMessage(
        CC.APPLY_MYSTERY,
        ([xpid, mysteryNum, ...rest]: number[]) => {
            if (mysteryNum === 0) {
                new Banana(
                    Player.clients.get(xpid)!.id,
                    new CANNON.Vec3(rest[0], rest[1], rest[2])
                );
            }
            if (mysteryNum === 1) {
                Player.clients.get(xpid)!.engine.turbo();
            }
            if (mysteryNum === 3) {
                new Wheels(
                    Player.clients.get(xpid)!.id,
                    new CANNON.Vec3(rest[0], rest[1], rest[2]),
                    new CANNON.Quaternion(rest[3], rest[4], rest[5], rest[6])
                );
            }
            if (mysteryNum === 2) {
                Player.clients
                    .get(xpid)!
                    .engine.rocket(
                        new CANNON.Vec3(rest[0], rest[1], rest[2]),
                        new CANNON.Quaternion(
                            rest[3],
                            rest[4],
                            rest[5],
                            rest[6]
                        )
                    );
            }
            if (mysteryNum === 4) {
                Player.clients.get(xpid)!.engine.mushroom();
            }
        }
    );
    Global.client.onMessage(CC.KEY_UP, (args: { pid: number; buffer: Buffer }) => {
        const xplayer = Player.clients.get(args.pid);
        const [key, ...data] = msgpack.decode(
            new Uint8Array(args.buffer)
        ) as number[];
        if (data.length && xplayer) {
            const [x, y, z, rx, ry, rz, rw] = data;
            if (isValidPosition(x, y, z)) {
                xplayer.position.set(x, y, z);
                xplayer.quaternion.set(rx, ry, rz, rw);
            }
        }
        xplayer?.keyboard.keysUp.add(key);
        xplayer?.keyboard.keysPressed.delete(key);
    });

    $(client.state).players.onRemove((player) => {
        const color = player?.color;
        if (color !== undefined) OnlinePlayer.clients.get(color)?.disconnect();
    })

    client.onLeave.once = () => {
        Global.goBack();
    };

    window.addEventListener("beforeunload", () => {
        Global.client.leave();
    });
    window.addEventListener("unload", () => {
        Global.client.leave();
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

    // blend pass
    if (Global.settings.motionBlur > 0) {
        const renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            stencilBuffer: false,
        };

        const savePass = new SavePass(
            new THREE.WebGLRenderTarget(
                window.innerWidth,
                window.innerHeight,
                renderTargetParameters
            )
        );

        const blendPass = new ShaderPass(BlendShader, "tDiffuse1");
        blendPass.uniforms["tDiffuse2"].value = savePass.renderTarget.texture;
        blendPass.uniforms["mixRatio"].value =
            (0.2 * Global.settings.motionBlur) / 100;

        // output pass

        const outputPass = new ShaderPass(CopyShader);
        outputPass.renderToScreen = true;

        // setup pass chain

        composer.addPass(blendPass);
        composer.addPass(savePass);
        composer.addPass(outputPass);
    }

    if (Global.settings.useBloom) composer.addPass(bloomPass);

    window.addEventListener("resize", () => {
        const s = 1;
        composer.setSize(s * window.innerWidth, s * window.innerHeight);
        Global.camera.aspect = window.innerWidth / window.innerHeight;
        Global.camera.updateProjectionMatrix();

        Global.renderer.setSize(s * window.innerWidth, s * window.innerHeight);
    });

    let beforeUpdate = () => { };
    if (Global.settings.displayWater) {
        const [waterGround, _beforeUpdate] = createWater(500, 500, 10, 10);
        for (const water of waterGround) {
            water.position.y -= 1;
        }
        beforeUpdate = _beforeUpdate;
        waterGround.forEach((c) => makeAutoLOD(c, Global.scene, [0, 200], [1.0, 0.35]));
    }

    Global.render = () => {
        beforeUpdate();

        // Global.renderer.render(Global.scene, Global.camera);
        composer.render();
    };
}

function setupSTATS() {
    if (Global.settings.useSTATS) {
        document.body.appendChild((Global.stats = new Stats()).dom);
    }
}

export default function (
    client: KartClient,
    pid: number,
    players: Map<number, [string, number, boolean]>,
    gameStartTime: number = 0
) {
    Global.optimizedObjects = [];
    Global.unoptimizedObjects = [];

    setupScene();
    setupPhysicsWorld();
    setupLights();
    setupRoad();
    setupObjects();

    setupControllers();
    setupWindowEvents();
    setupRenderer();

    setupSTATS();

    requestAnimationFrame(() => {
        setupSocket(client, pid, players, gameStartTime);
    });
}
