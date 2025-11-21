import { MysteryBoxSchema } from "@/rooms/schema/KartRaceState";
import { GameContext } from "@/store/Context";
import * as CANNON from "cannon-es";

export class MysteryBoxEntity extends CANNON.Body {
    constructor(private context: GameContext, private schema: MysteryBoxSchema) {
        const size = 0.4;
        const position = new CANNON.Vec3(schema.position.x, schema.position.y, schema.position.z);

        super({
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

        this.addEventListener("collide", (event: { body: CANNON.Body }) => {
            if (
                this.schema.visible &&
                context.playersBodies.has(event.body.id)
            ) {
                this.schema.assign({ visible: false });
                setTimeout(() => {
                    this.schema.assign({ visible: true });
                }, 1000);


            }
        });
        
        this.context.world.addBody(this);
    }
}
