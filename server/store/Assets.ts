import * as THREE from "three";
import {
    FBXLoader,
    Font,
    FontLoader,
    GLTF,
    GLTFLoader,
} from "three/examples/jsm/Addons.js";
import { Global } from "./Global";

export type loadedAssets = {
    gltf: { [key: string]: GLTF };
    fbx: { [key: string]: THREE.Group };
    textures: { [key: string]: THREE.Texture };
    fonts: { [key: string]: Font };
    sfx: { [key: string]: AudioBuffer };
};

export function loadMeshes(items: Record<string, string>) {
    return new Promise<void>((resolve, reject) => {
        const loadingManager = new THREE.LoadingManager();

        Global.assets = {
            gltf: {},
            fbx: {},
            textures: {},
            fonts: {},
            sfx: {},
        } as loadedAssets;

        const loaders = [
            new GLTFLoader(loadingManager),
            new FBXLoader(loadingManager),
            new THREE.TextureLoader(loadingManager),
            new FontLoader(loadingManager),
            new THREE.AudioLoader(loadingManager),
        ] as THREE.Loader[];

        // const itemsLength = Object.keys(items).length;
        // let itemProgress = 0;
        // let minerProgress = 0;

        const keys: Array<keyof loadedAssets> = [
            "gltf",
            "fbx",
            "textures",
            "fonts",
            "sfx",
        ];

        const exts = [
            [".gltf", ".glb"],
            [".fbx"],
            [".png"],
            [".typeface.json"],
            [".mp3", ".wav"],
        ];

        for (const itemEntry of Object.entries(items)) {
            const [itemName, itemSrc] = itemEntry;

            const index = exts.findIndex((formats) => {
                for (const format of formats) {
                    if (itemSrc.endsWith(format)) return true;
                }
                return false;
            });

            if (index < 0) continue;

            const selectedLoader = loaders[index];
            const selectedKey = keys[index];

            selectedLoader.load(
                itemSrc,
                (mesh1) => {
                    // @ts-ignore
                    Global.assets[selectedKey][itemName] = mesh1;

                    // itemProgress += 1 / itemsLength;
                    // minerProgress = 0;
                    // Global.assets.progress = itemProgress;
                },
                (progres) => {
                    // minerProgress = progres.loaded / progres.total;
                    // Global.assets.progress =
                    //     itemProgress + minerProgress / itemsLength;
                },
                (error) => {
                    reject(error);
                }
            );
        }

        loadingManager.onLoad = () => {
            Global.assets = Global.assets;

            resolve();
        };
    });
}
