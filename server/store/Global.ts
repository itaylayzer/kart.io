import * as THREE from "three";
import * as CANNON from "cannon-es";
import { loadedAssets } from "./Assets";
import { Player } from "../player/Player";

export class Global {
  public static deltaTime: number;
  public static roadMesh: THREE.Mesh;
  public static world: CANNON.World;
  public static scene: THREE.Scene;
  public static assets: loadedAssets;
  public static sockets: {
    emitAll: (eventName: string, eventArgs: any) => void;
    emitExcept: (exceptID: string, eventName: string, eventArgs: any) => void;
  };
  public static players: Map<string, Player>;
}
