import {
  CatmullRomCurve3,
  LOD,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { MouseController } from "../controller/MouseController";
import { CameraController } from "../controller/CameraController";

import CannonDebugger from "cannon-es-debugger";
import { loadedAssets } from "@/src/store/useAssetLoader";
import { Action } from "@/src/hooks/useDestroy";
import {
  EffectComposer,
  PointerLockControls,
} from "three/examples/jsm/Addons.js";
import { LocalPlayer } from "../player/LocalPlayer";
import System from "three-nebula";
import { Socket } from "socket.io-client";
import * as CANNON from "cannon-es";
import { settingsType } from "@/src/store/useSettingsStore";
import Stats from "three/examples/jsm/libs/stats.module.js";

export class Global {
  public static mouseController: MouseController;
  public static scene: Scene;
  public static container: HTMLDivElement;
  public static renderer: WebGLRenderer;
  public static camera: PerspectiveCamera;
  public static cameraController: CameraController;
  public static cannonDebugger: ReturnType<typeof CannonDebugger>;
  public static deltaTime: number = 0;
  public static elapsedTime: number = 0;
  public static assets: loadedAssets;
  public static updates: Action[];
  public static lockController: PointerLockControls;
  public static localPlayer: LocalPlayer;
  public static system: System;
  public static roadMesh: Mesh[];
  public static socket: Socket | undefined;
  public static world: CANNON.World;
  public static lod: LOD;
  public static composer: EffectComposer;
  public static render: Action;
  public static curve: CatmullRomCurve3;
  public static lateUpdates: Action[];
  public static settings: settingsType;
  public static stats: Stats;
}
