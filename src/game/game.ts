import { loadedAssets } from "../viewmodels/useAssetLoader";
import setupWorld from "./api/setup/world";
import { Global } from "./store/Global";
import { PhysicsObject } from "./physics/PhysicsMesh";
import * as THREE from "three";
import System, { SpriteRenderer } from "three-nebula";
import { WorldMap } from "./player/WorldMap";

export default (assets: loadedAssets) => {
  Global.assets = assets;

  setupWorld();

  Global.system = new System();
  Global.system.addRenderer(new SpriteRenderer(Global.scene, THREE));

  const clock = new THREE.Clock();

  const map = new WorldMap();

  const animate = () => {
    Global.deltaTime = clock.getDelta();

    Global.updates
      .concat(PhysicsObject.childrens.flatMap((v) => v.update))
      .map((fn) => fn());

    Global.system.update();
    Global.render();
    Global.world.step(2.6 * Global.deltaTime);

    map.update();

    // Global.cannonDebugger.update();
    Global.mouseController.lastUpdate();

    Global.stats.update();
  };

  setInterval(animate, 1000 / 120);

  return {
    destroyer: () => {
      // while (Global.container.firstChild) Global.container.removeChild(Global.container.firstChild);
    },
  };
};
