import { Global } from "../../store/Global";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import { createRoad } from "./road2";

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

function setupScene() {
    Global.scene = new THREE.Scene();
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

    Global.roadMesh = m;
    Global.scene.add(dotsM);
    Global.scene.add(m);
}

export default function () {
    setupScene();
    setupPhysicsWorld();
    setupLights();
    setupControllers();
    setupRoad();
}
