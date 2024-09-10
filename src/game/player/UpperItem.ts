import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { Global } from "../store/Global";
import { lerp } from "three/src/math/MathUtils.js";


export class UpperItem extends THREE.Group {
    public update: () => void;
    constructor(buildMesh: () => THREE.Object3D) {
        super();

        const obj = new THREE.Object3D();
        obj.add(buildMesh());
        obj.position.y -= 1;
        obj.scale.set(0, 0, 0);
        let ended = [0, 0];

        const tween = [
            new TWEEN.Tween(obj.position)
                .to(new THREE.Vector3(0, 0, 0))
                .duration(2000)
                .easing(TWEEN.Easing.Back.Out)
                .onComplete(() => (ended[0] = 1)),
            new TWEEN.Tween(obj.scale)
                .to(new THREE.Vector3(1, 1, 1))
                .duration(2000)
                .easing(TWEEN.Easing.Exponential.Out),
            new TWEEN.Tween({ x: -10 })
                .to({ x: 0 })
                .duration(2000)
                .easing(TWEEN.Easing.Quartic.Out)
                .onUpdate(({ x }) => {
                    obj.rotation.y = x;
                    // obj.rotation.z = x;
                }),
        ];

        super.add(obj);

        tween.map((v) => v.start(-100));
        this.update = () => {
            ended[1] = lerp(ended[1], ended[0], Global.deltaTime * 7);
            this.position.set(
                0,
                Math.sin(Global.elapsedTime * 2) * 0.02 + 0.25,
                0
            );
            tween.map((v) => v.update(Global.elapsedTime * 1000));
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
        banana.scale.multiplyScalar(0.03);

        const banaColor = banana.getObjectByName(
            "pCylinder3_Light_Wood_Lambert_0"
        ) as THREE.Mesh;
        (banaColor.material as THREE.MeshStandardMaterial).emissive =
            new THREE.Color("#a16a52");
        (
            banaColor.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 5;
        banana.position.y = 0.15;
        banana.rotation.x = (-Math.PI * 2) / 4;
        banana.rotation.y = (-Math.PI * 3) / 4;
        return banana;
    }
}
