import { loadedAssets } from "../viewmodels/useAssetLoader";
import setupWorld from "./api/setup/world";
import { Global } from "./store/Global";
import { PhysicsObject } from "./physics/PhysicsMesh";
import * as THREE from "three";
import System, { SpriteRenderer } from "three-nebula";
import { Player } from "./player/Player";

export default (assets: loadedAssets) => {
  Global.assets = assets;

  setupWorld();

  const renderer = new SpriteRenderer(Global.scene, THREE);
  Global.system = new System();
  Global.system.addRenderer(renderer);

  const clock = new THREE.Clock();
  Global.lockController.lock();

  const animate = () => {
    Global.deltaTime = clock.getDelta();
    Global.keyboardController.firstUpdate();

    Global.updates
      .concat(PhysicsObject.childrens.flatMap((v) => v.update))
      .map((fn) => fn());

    for (const player of Player.clients.values()) {
      player.predictedUpdate();
    }
    Global.cameraController.update();

    Global.system.update();
    Global.renderer.render(Global.scene, Global.camera);

    // Global.cannonDebugger.update();

    Global.mouseController.lastUpdate();
    Global.keyboardController.lastUpdate();

    Global.stats.update();
  };

  setInterval(() => {
    animate();
  }, 1000 / 120);

  return {
    destroyer: () => {
      // while (Global.container.firstChild) Global.container.removeChild(Global.container.firstChild);
    },
  };
};
