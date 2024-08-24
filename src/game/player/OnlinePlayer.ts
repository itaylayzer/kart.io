import * as THREE from "three";
import { Global } from "../store/Global";
import createPlayerNameSprite from "../api/createPlayerNameSprite";

export class OnlinePlayer {
    public static clients: Map<string, OnlinePlayer>;

    public update: (
        position: THREE.Vector3,
        quaternion: THREE.Quaternion,
        velocity: number,
        horizontal: number
    ) => void;
    public disconnect: () => void;
    static {
        this.clients = new Map();
    }
    constructor(id: string, public name: string) {
        OnlinePlayer.clients.set(id, this);

        const group = new THREE.Group();
        const model = Global.assets.gltf.car.scene.clone();
        model.scale.multiplyScalar(0.5 / 3);

        group.add(model);
        const backweels = model.getObjectByName("Back_Wheels_38")!;
        const frontweels = model.getObjectByName("Front_Wheels_47")!;
        const steeringweel = model.getObjectByName("Wheel_25")!;
        model.getObjectByName("Back_18")!.visible = false;

        const nametag = createPlayerNameSprite(name, "#ff0000");
        nametag.position.y += 0.35;
        group.add(nametag);
        this.update = (position, quaternion, velocity, horizontal) => {
            group.position.copy(position);
            group.quaternion.copy(quaternion);

            model.rotation.set(0, 0, 0);

            backweels.rotateX(velocity);
            frontweels.rotation.y = horizontal * 0.4;

            for (const [id, cf] of frontweels.children.entries()) {
                id < 2 ? cf.rotateY(velocity) : cf.rotateX(velocity);
            }

            steeringweel.rotation.set(0, 0, 0);
            steeringweel.rotateOnAxis(
                new THREE.Vector3(0, -0.425, 1),
                (-horizontal * Math.PI * 2) / 3
            );
        };
        this.disconnect = () => {
            Global.scene.remove(group);
            OnlinePlayer.clients.delete(id);
        };

        Global.scene.add(group);
    }
}
