import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { Global } from "../store/Global";

export class ItemModel extends THREE.Group {
    public update: () => void;
    public stop: (stopFn: () => void) => void;
    public stopping: boolean;
    constructor(buildMesh: () => THREE.Object3D) {
        super();

        const obj = new THREE.Object3D();
        obj.add(buildMesh());
        obj.position.y -= 1;
        obj.scale.set(0, 0.2, 0);

        const fromTweens = [
            new TWEEN.Tween(obj.position)
                .to(new THREE.Vector3(0, 0, 0))
                .duration(1250)
                .easing(TWEEN.Easing.Back.Out),
            new TWEEN.Tween(obj.scale)
                .to(new THREE.Vector3(1, 1, 1))
                .duration(1000)
                .easing(TWEEN.Easing.Linear.None),
            new TWEEN.Tween({ x: -10 })
                .to({ x: 0 })
                .duration(1250)
                .easing(TWEEN.Easing.Quartic.Out)
                .onUpdate(({ x }) => {
                    obj.rotation.y = x;
                }),
        ];
        const toTweens = [
            new TWEEN.Tween({ x: 0, y: 0, z: 0 })
                .to({ x: 0, y: -1, z: 0 })
                .duration(800)
                .easing(TWEEN.Easing.Back.In)
                .onUpdate((v) => obj.position.copy(v)),
            new TWEEN.Tween({ x: 1, y: 1, z: 1 })
                .to({ x: 0, y: 0.2, z: 0 })
                .duration(800)
                .easing(TWEEN.Easing.Linear.None)
                .onUpdate((v) => obj.scale.copy(v)),
            new TWEEN.Tween({ x: 0 })
                .to({ x: -10 })
                .duration(600)
                .easing(TWEEN.Easing.Quartic.In)
                .onUpdate(({ x }) => {
                    obj.rotation.y = x;
                }),
        ];

        let startTime = Global.elapsedTime - 0.255;
        this.stopping = false;
        super.add(obj);

        fromTweens.map((v) => v.start(0));

        this.stop = (stopFn) => {
            fromTweens.map((v) => v.stop());
            this.stopping = true;
            toTweens.map((v) => v.start(0));
            toTweens[2].onComplete(stopFn);
            startTime = Global.elapsedTime;
        };

        this.update = () => {
            this.position.set(
                0,
                Math.sin(Global.elapsedTime * 2) * 0.02 + 0.25,
                0
            );

            const time = (Global.elapsedTime - startTime) * 1000;

            [fromTweens, toTweens][+this.stopping].map((v) => v.update(time));
        };
    }

    public static banana() {
        const banana = Global.assets.gltf.banana.scene.clone();
        banana.scale.multiplyScalar(0.0015);

        const banaColor = banana.getObjectByName("Object_2") as THREE.Mesh;
        (banaColor.material as THREE.MeshStandardMaterial).emissive =
            new THREE.Color("gold");
        (
            banaColor.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 2;
        banana.position.x = -0.05;
        return banana;
    }

    public static boots() {
        const banana = Global.assets.gltf.boots.scene.clone();
        banana.scale.multiplyScalar(0.06);
        banana.position.y = 0.05;

        const banaColor = banana.getObjectByName(
            "Fan_outer_part_of_the_turbo_body_Fan_Main_Color_0"
        ) as THREE.Mesh;
        (banaColor.material as THREE.MeshStandardMaterial).emissive =
            new THREE.Color("white");
        (
            banaColor.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 10;
        banana.rotation.y = Math.PI / 2;

        return banana;
    }
    public static rocket() {
        const banana = Global.assets.gltf.rocket.scene.clone();
        banana.scale.multiplyScalar(0.1);

        const banaColor = banana.getObjectByName(
            "Rocket_Ship_01_Material_#28_0"
        ) as THREE.Mesh;
        (banaColor.material as THREE.MeshStandardMaterial).emissive =
            new THREE.Color("red");
        (
            banaColor.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 8;
        banana.position.y = 0.05;
        banana.rotation.y = Math.PI;

        return banana;
    }
    public static wheels() {
        const banana = Global.assets.gltf.wheel.scene.clone();
        banana.scale.multiplyScalar(0.03 * 4);

        // const banaColor = banana.getObjectByName(
        //     "GeoSphere001_Material_#26_0"
        // ) as THREE.Mesh;
        // (banaColor.material as THREE.MeshStandardMaterial).emissive =
        //     new THREE.Color("blue");
        // (
        //     banaColor.material as THREE.MeshStandardMaterial
        // ).emissiveIntensity = 10;
        // banana.position.y = 0.15;
        // banana.rotation.x = (-Math.PI * 2) / 4;
        // banana.rotation.y = (-Math.PI * 3) / 4;
        banana.position.y += 0.1;
        return banana;
    }
}
