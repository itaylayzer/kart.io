import { Socket } from "socket.io-client";
import * as THREE from "three";
import System, { SpriteRenderer } from "three-nebula";
import { loadedAssets } from "../store/useAssetLoader";
import { settingsType } from "../store/useSettingsStore";
import { createVectorsFromNumbers } from "./api/setup/road";
import setupWorld from "./api/setup/world";
import { curvePoints } from "@shared/config/road";
import { PhysicsObject } from "./physics/PhysicsMesh";
import { Scoreboard } from "./player/Scoreboard";
import { WorldMap } from "./player/WorldMap";
import { Global } from "./store/Global";

const game = (
    assets: loadedAssets,
    socket: Socket,
    pid: number,
    players: Map<number, [string, number, boolean]>,
    settings: settingsType,
    mapIndex: number,
    goBack: () => void
) => {
    Global.assets = assets;
    Global.settings = settings;
    Global.curve = new THREE.CatmullRomCurve3(
        createVectorsFromNumbers(curvePoints[mapIndex])
    );

    const scoreboard = new Scoreboard();
    setupWorld(socket, pid, players);

    Global.system = new System();
    Global.system.addRenderer(new SpriteRenderer(Global.scene, THREE));

    const clock = new THREE.Clock();

    const map = new WorldMap();

    const animate = () => {
        if (document.visibilityState === "hidden") return;
        try {
            Global.deltaTime = clock.getDelta();
            Global.elapsedTime = clock.getElapsedTime();

            for (const mesh of Global.optimizedObjects) {
                mesh.visible =
                    mesh.position.distanceTo(Global.camera.position) < 50;
            }

            Global.updates
                .concat(PhysicsObject.childrens.flatMap((v) => v.update))
                .map((fn) => fn());
            Global.lateUpdates.map((f) => f());

            scoreboard.update();
            Global.lod.update(Global.camera);
            Global.system.update();
            Global.render();
            try {
                Global.world.step(2.6 * Global.deltaTime);
            } catch (er) {
                console.error(er);
            }

            map.update();

            if (Global.settings.renderColliders) Global.cannonDebugger.update();
            Global.mouseController.lastUpdate();

            if (Global.settings.useSTATS) {
                Global.stats.update();
            }
        } catch (er) {
            console.error(er);
        }
    };

    let interval: undefined | number = undefined;

    if (Global.settings.useVsync) Global.renderer.setAnimationLoop(animate);
    else {
        // @ts-ignore
        interval = setInterval(animate, 1000 / Global.settings.fps);
    }

    Global.goBack = () => {
        setTimeout(() => {
            try {
                Global.socket?.disconnect();
            } catch { }

            Global.renderer.dispose();
            goBack();
        }, 100);

        Global.renderer.setAnimationLoop(null);

        interval !== undefined && clearInterval(interval);
    };

    return {
        destroyer: () => {
            // Global.goBack();
        },
    };
};

export default game;