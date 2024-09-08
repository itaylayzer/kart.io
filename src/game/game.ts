import { loadedAssets } from "../store/useAssetLoader";
import setupWorld from "./api/setup/world";
import { Global } from "./store/Global";
import { PhysicsObject } from "./physics/PhysicsMesh";
import * as THREE from "three";
import System, { SpriteRenderer } from "three-nebula";
import { WorldMap } from "./player/WorldMap";
import { Socket } from "socket.io-client";
import { Scoreboard } from "./player/Scoreboard";
import { settingsType } from "../store/useSettingsStore";

export default (
  assets: loadedAssets,
  socket: Socket,
  pid: number,
  players: Map<number, [string, number, boolean]>,
  settings: settingsType
) => {
  Global.assets = assets;
  Global.settings = settings;

  const scoreboard = new Scoreboard();
  setupWorld(socket, pid, players);

  Global.system = new System();
  Global.system.addRenderer(new SpriteRenderer(Global.scene, THREE));

  const clock = new THREE.Clock();

  const map = new WorldMap();
  Global.lockController.lock();
  const animate = () => {
    try {
      Global.deltaTime = clock.getDelta();

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

  if (Global.settings.useVsync) Global.renderer.setAnimationLoop(animate);
  else setInterval(animate, 1000 / Global.settings.fps);

  return {
    destroyer: () => {
      // while (Global.container.firstChild) Global.container.removeChild(Global.container.firstChild);
    },
  };
};
