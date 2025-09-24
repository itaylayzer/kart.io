import { PhysicsObject } from "../../physics/PhysicsMesh";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Global } from "../../store/Global";
import { randFloat } from "three/src/math/MathUtils.js";
import { CS } from "@shared/types/codes";
import { LocalPlayer } from "../../player/LocalPlayer";
export class MysteryBox extends PhysicsObject {
    public static boxes: Map<number, MysteryBox>;
    public group: THREE.Group;
    static {
        this.boxes = new Map();
    }
    public mysteryVisible: boolean;
    constructor(id: number, position: CANNON.Vec3) {
        const size = 0.4;
        const group = new THREE.Group();
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            new THREE.MeshPhongMaterial({
                map: Global.assets.textures.mystery,
                opacity: 0.2,
                transparent: true,
                side: THREE.DoubleSide,
                emissiveIntensity: 5,
                emissive: "orange",
            })
        );
        group.add(mesh);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        super(group, {
            shape: new CANNON.Box(
                new CANNON.Vec3(size / 2, size / 2, size / 2)
            ),
            mass: 0,
            position,
            material: new CANNON.Material({ friction: 0, restitution: 0 }),
            linearDamping: 0.9,
            angularDamping: 0.999,
            isTrigger: true,
            collisionFilterGroup: 3,
            collisionFilterMask: 1,
        });

        this.mysteryVisible = true;
        this.group = group;

        Global.lod.add(group);

        group.position.copy(position);
        this.position.set(position.x, position.y - 0.25, position.z);

        let x = randFloat(-2, 2);
        let y = randFloat(-2, 2);
        let z = randFloat(-2, 2);
        this.update = [
            () => {
                mesh.rotateX(x * Global.deltaTime);
                mesh.rotateY(y * Global.deltaTime);
                mesh.rotateZ(z * Global.deltaTime);

                group.visible =
                    this.mysteryVisible &&
                    group.position.distanceTo(Global.camera.position) < 50;
            },
        ];

        MysteryBox.boxes.set(id, this);

        this.addEventListener("collide", (event: { body: CANNON.Body }) => {
            if (
                this.mysteryVisible &&
                event.body.id === LocalPlayer.getInstance().id
            ) {
                Global.socket?.emit(CS.TOUCH_MYSTERY, id);
            }
        });
        Global.world.addBody(this);
    }

    static toggleMystery(id: number, isVisible: boolean) {
        this.boxes.get(id)!.mysteryVisible = isVisible;
    }
}
