import * as THREE from "three";
import { IKeyboardController } from "../controller/IKeyboardController";
import { damp, randInt } from "three/src/math/MathUtils.js";
import { Global } from "../store/Global";
import createPlayerNameSprite from "../api/createPlayerNameSprite";
import * as CANNON from "cannon-es";
import { Dust } from "../api/meshes/Dust";
import { Easing, Tween } from "@tweenjs/tween.js";
import { Trail } from "../api/meshes/Trail";

const namesToColor = [
    "Object_43",
    "Object_41",
    "Object_87",
    "Object_85",
    "Object_68",
    "Object_70",
    "Object_83",
    "Object_62",
    "Object_66",
    "Object_72",
    "Object_64",
    "Object_79",
    "Object_89",
    "Object_81",
];

export class PlayerModel extends THREE.Group {
    public update: () => void;
    public setRocketModel: (a: boolean) => void;
    public shake: (duration: number) => void;

    constructor(
        body: CANNON.Body,
        keyboard: IKeyboardController,
        name: string,
        tagNameColor: [string, number],
        isLocal: boolean
    ) {
        super();
        const model = Global.assets.gltf.car.scene.clone();
        model.traverse((part) => {
            const partAsMesh = part as THREE.Mesh;
            if (partAsMesh) {
                const mat = partAsMesh.material as THREE.MeshStandardMaterial;
                if (mat) {
                    if (namesToColor.includes(partAsMesh.name)) {
                        partAsMesh.material = new THREE.MeshPhongMaterial({
                            color: tagNameColor[0],
                            emissive: tagNameColor[0],
                            emissiveIntensity: tagNameColor[1],
                        });
                    } else {
                        mat.roughness = 1;
                        mat.metalness = 0.8;
                    }
                }
            }
        });

        let tween: undefined | Tween = undefined;
        let startTime = 0;

        model.scale.multiplyScalar(0.5 / 3);
        const rocket = Global.assets.gltf.rocket.scene.clone();
        rocket.rotation.y = -Math.PI / 2;
        rocket.rotation.z = -Math.PI;
        rocket.rotation.x = (-Math.PI * 3) / 4;
        rocket.scale.multiplyScalar(0.4);
        rocket.position.y += 0.25;
        const backweels = model.getObjectByName("Back_Wheels_38")!;
        const frontweels = model.getObjectByName("Front_Wheels_47")!;
        const steeringweel = model.getObjectByName("Wheel_25")!;
        model.getObjectByName("Back_18")!.visible = false;
        super.add(model);
        rocket.visible = false;
        super.add(rocket);

        const realWeelsNames = [
            "Object_75",
            "Object_60",
            "Object_58",
            "Object_77",
        ];

        const trails: Trail[] = [];

        {
            const trail = new Trail(rocket, 3, ["gray", 0], 0.1, 100, 1);

            Global.lod.add(trail);
            trails.push(trail);
        }

        {
            const trail = new Trail(
                model.getObjectByName("Object_43")!,
                3 * (+!isLocal + 1),
                tagNameColor,
                0.04,
                100,
                [0.5, 0.05][+isLocal]
            );

            Global.lod.add(trail);
            trails.push(trail);
        }

        for (const realWeelName of realWeelsNames) {
            const trail = new Trail(
                model.getObjectByName(realWeelName)!,
                2 * (+!isLocal + 1),
                tagNameColor,
                0.025,
                100,
                [0.5, 0.05][+isLocal]
            );

            Global.lod.add(trail);
            trails.push(trail);
        }

        const rockBack = rocket.getObjectByName(
            "Rocket_Ship_01_Material_#42_0"
        )!;
        rockBack.visible = false;

        if (!isLocal) {
            const nametag = createPlayerNameSprite(name);
            nametag.position.y += 0.35;
            super.add(nametag);
        }
        let driftSide = [0, 0];

        this.setRocketModel = (a) => {
            rocket.visible = [false, true][+a];
            model.visible = [true, false][+a];
        };

        this.shake = (Duration) => {
            tween = new Tween({ x: 0 })
                .to({ x: Math.PI * 2 })
                .duration(Duration)
                .easing(Easing.Quintic.Out)
                .onUpdate(({ x }) => {
                    model.rotation.y = x;
                })
                .onComplete(() => {
                    model.rotation.y = 0;
                });
            tween.start(0);
            startTime = Global.elapsedTime;
        };

        this.update = () => {
            this.position.copy(body.position);
            this.quaternion.copy(body.quaternion);

            model.rotation.set(0, 0, 0);

            if (rocket.visible && randInt(0, 1)) {
                new Dust(rockBack.getWorldPosition(new THREE.Vector3()));
            }
            if (keyboard.isKeyDown(32) || keyboard.isKeyDown(-6)) {
                driftSide[0] = keyboard.horizontalRaw * 0.6;
            }
            if (keyboard.isKeyUp(32) || keyboard.isKeyUp(-6)) {
                driftSide[0] = 0;
            }
            tween?.update((Global.elapsedTime - startTime) * 1000);
            driftSide[1] = damp(
                driftSide[1],
                driftSide[0],
                1.5,
                Global.deltaTime * 7
            );
            model.rotateOnAxis(new THREE.Vector3(0, 1, 0), driftSide[1]);

            this.rotation.set(0, 0, 0);

            const forwardVec = body.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
            const velocityMagnitude = forwardVec.dot(body.velocity.clone());

            backweels.rotateX(velocityMagnitude);
            frontweels.rotation.y = keyboard.horizontal * 0.4;

            for (const [id, cf] of frontweels.children.entries()) {
                id < 2
                    ? cf.rotateY(velocityMagnitude)
                    : cf.rotateX(velocityMagnitude);
            }

            steeringweel.rotation.set(0, 0, 0);
            steeringweel.rotateOnAxis(
                new THREE.Vector3(0, -0.425, 1),
                (-keyboard.horizontal * Math.PI * 2) / 3
            );

            this.position.copy(body.position);
            this.quaternion.copy(body.quaternion);

            trails.forEach((v) => v.update());
        };
    }
}
