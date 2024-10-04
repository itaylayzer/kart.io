import { Player } from "./Player";
import { KeyboardController } from "../controller/KeyboardController";
import { TrackerController } from "../controller/TrackerController";
import { Global } from "../store/Global";
import { SpeedLine1 } from "../api/meshes/SpeedLine1";
export class LocalPlayer extends Player {
    private static instance: LocalPlayer;

    static getInstance() {
        return this.instance;
    }
    constructor(id: number, name: string, color: number) {
        super(id, true, name, color, new KeyboardController());
        LocalPlayer.instance = this;
        new SpeedLine1(this);

        Global.lateUpdates.push(() => {
            TrackerController.update(id);
        });
    }
}
