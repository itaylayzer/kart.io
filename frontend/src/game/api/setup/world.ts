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
import { colors } from "../../constants";
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
    const roadsSegments = createRoad(Global.curve, 5, 200, 3000);
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
        setTimeout(() => {
            const tiles = createFencesPilars(
                Global.curve,
                5.1,
                100,
                1400,
                roadsSegments
            );
            Global.lod.add(...tiles);
            Global.optimizedObjects.push(...tiles);
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
    client: KartClient,
    localID: number,
    players: Map<number, [string, number, boolean]>
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

    StartTimer.start(client.state.startTime);


    requestAnimationFrame(() => {
        Global.container.appendChild(Global.renderer.domElement);
        Global.lockController.lock();
    });

    client.state.mysteries.forEach(({ position: { x, y, z } }, id) => {
        new MysteryBox(id, new CANNON.Vec3(x, y, z));
    })

    client.state.players.forEach(({ color, startTransform }, key) => {
        const xplayer = Player.clients.get(color);
        if (xplayer === undefined) return;
        {
            const { x, y, z } = startTransform.position;
            xplayer.position.set(x, y, z);
        }

        {
            const { x, y, z, w } = startTransform.quaternion;
            xplayer.quaternion.set(x, y, z, w);
        }

        xplayer.velocity.setZero();
        xplayer.force.setZero();

        xplayer.tracker.reset();
    })

    AudioController.init();

    client.onMessage(CC.MYSTERY_ITEM, (itemIndex: number) => {
        LocalPlayer.getInstance().items.setItem(itemIndex);
    })

    Global.client.onMessage(CC.KEY_DOWN, (args: { pid: number; buffer: Buffer }) => {
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

    Global.client.onMessage(CC.UPDATE_TRANSFORM, (buffer: Buffer) => {
        const [pid, ...data] = msgpack.decode(
            new Uint8Array(buffer)
        ) as number[];
        const xplayer = Player.clients.get(pid);
        const [x, y, z, rx, ry, rz, rw] = data;
        xplayer?.position.set(x, y, z);
        xplayer?.quaternion.set(rx, ry, rz, rw);
    });

    Global.client.onMessage(CC.FINISH_LINE, (pid: number) => {
        TrackerController.FINALS.push(pid);
    });

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
        if (data.length) {
            const [x, y, z, rx, ry, rz, rw] = data;
            xplayer?.position.set(x, y, z);
            xplayer?.quaternion.set(rx, ry, rz, rw);
        }
        xplayer?.keyboard.keysUp.add(key);
        xplayer?.keyboard.keysPressed.delete(key);
    });

    $(client.state).players.onRemove(({ color }) => {
        OnlinePlayer.clients.get(color)?.disconnect();

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
        Global.optimizedObjects.push(...waterGround);
        beforeUpdate = _beforeUpdate;
        Global.lod.add(...waterGround);
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

    requestAnimationFrame(() => {
        setupSocket(client, pid, players);
    });
}
