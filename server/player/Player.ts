import { Socket } from "socket.io";
import { PlayerInformation } from "./PlayerInformation";
import { GameState, UpdateObject } from "../game/GameState";
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

    public collider: PlayerCollision;

    constructor(
        public info: PlayerInformation,
        public game: GameState
    ) {
        const keyboard = new PlayerKeyboard(game);
        this.collider = new PlayerCollision(this.info.pid);
        const tracker = new PlayerTracker(this, game);
        const model = new PlayerModel(this.collider, keyboard, game);
        const driver = new PlayerDriver(5, keyboard, game, this.collider, tracker, model);


        this.update = () => {
            keyboard.firstUpdate();
            tracker.update();
            driver.update();
            model.update();
            keyboard.lastUpdate();
        }
        this.setTransform = (transforms: number[]) => {

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
