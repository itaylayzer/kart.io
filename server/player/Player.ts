import { PlayerInformation } from "./PlayerInformation";
import { GameState } from "../game/GameState";
import { PlayerModel } from "./PlayerModel";
import { PlayerKeyboard } from "./PlayerKeyboard";
import { PlayerDriver } from "./PlayerDriver";
import { PlayerCollision } from "./PlayerCollision";
import { PlayerTracker } from "./PlayerTracker";

export class Player {
    public update: () => void;
    public setTransform: (transforms: number[]) => void;
    public disconnectFromWorld: () => void;
    public connectToWorld: () => void;
    public pack: () => number[];

    public collider: PlayerCollision;
    public keyboard: PlayerKeyboard;
    constructor(
        public info: PlayerInformation,
        public game: GameState
    ) {
        this.keyboard = new PlayerKeyboard(game);
        this.collider = new PlayerCollision(this.info.pid);
        const tracker = new PlayerTracker(this, game);
        const model = new PlayerModel(this.collider, this.keyboard, game);
        const driver = new PlayerDriver(5, this.keyboard, game, this.collider, tracker, model);


        this.update = () => {
            this.keyboard.firstUpdate();
            tracker.update();
            driver.update();
            model.update();
            this.keyboard.lastUpdate();
            // console.log(this.collider.velocity.toArray(), Array.from(this.keyboard.keysPressed.values()));

        }
        this.pack = () => {
            return [this.collider.position.x * 10000,
            this.collider.position.y * 10000,
            this.collider.position.z * 10000,
            this.collider.quaternion.x * 10000,
            this.collider.quaternion.y * 10000,
            this.collider.quaternion.z * 10000,
            this.collider.quaternion.w * 10000,]
        }
        this.setTransform = (transform: number[]) => {
            [
                this.collider.position.x,
                this.collider.position.y,
                this.collider.position.z,
                this.collider.quaternion.x,
                this.collider.quaternion.y,
                this.collider.quaternion.z,
                this.collider.quaternion.w,
            ] = transform;
            model.update();
            this.collider.velocity.setZero();
            this.collider.force.setZero();
        }
        this.connectToWorld = () => {
            game.scene.add(model);
            game.world.addBody(this.collider)
        }
        this.disconnectFromWorld = () => {
            game.scene.remove(model);
            game.world.removeBody(this.collider)
        }
    }
}
