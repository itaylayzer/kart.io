import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { create } from "zustand";

// https://gero3.github.io/facetype.js/

export type loadedAssets = {
    gltf: { [key: string]: GLTF };
    fbx: { [key: string]: THREE.Group };
    textures: { [key: string]: THREE.Texture };
    fonts: { [key: string]: Font };
    sfx: { [key: string]: AudioBuffer };
    progress: number;
};

const defualtValue: loadedAssets = {
    fbx: {},
    fonts: {},
    gltf: {},
    textures: {},
    sfx: {},
    progress: 0,
};

type AssetStore = loadedAssets & {
    loadMeshes(items: Record<string, string>): Promise<void>;
    skipAssets: () => void;
};

export const useAssetStore = create<AssetStore>((set) => ({
    ...defualtValue,
    loadMeshes(items) {
        const SetProgress = (progress: number) => set({ progress });
        return new Promise<void>((resolve, reject) => {
            const loadingManager = new THREE.LoadingManager();

            const _assets = {
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

            const itemsLength = Object.keys(items).length;
            let itemProgress = 0;
            let minerProgress = 0;

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
                        _assets[selectedKey][itemName] = mesh1;

                        itemProgress += 1 / itemsLength;
                        minerProgress = 0;
                        set({ progress: itemProgress });
                    },
                    (progres) => {
                        minerProgress = progres.loaded / progres.total;
                        set({
                            progress:
                                itemProgress + minerProgress / itemsLength,
                        });
                    },
                    (error) => {
                        reject(error);
                    }
                );
            }

            loadingManager.onLoad = () => {
                set({ ..._assets });
                setTimeout(() => {
                    SetProgress(2);
                }, 500);

                resolve();
            };
        });
    },
    skipAssets() {
        set({ progress: 2 });
    },
}));
