import { Player } from "./Player";
import { KeyboardController } from "../controller/KeyboardController";
import { TrackerController } from "../controller/TrackerController";
import { Global } from "../store/Global";
import { PredictionController } from "../net/PredictionController";

export class LocalPlayer extends Player {
    private static instance: LocalPlayer;
    private net: PredictionController;

    static getInstance() {
        return this.instance;
    }
    constructor(id: number, name: string, color: number) {
        super(id, true, name, color, new KeyboardController());
        LocalPlayer.instance = this;
        Global.localPlayer = this;
        this.net = new PredictionController(this.pid, this.keyboard);
        Global.lateUpdates.push(() => {
            this.net.update(this);
            TrackerController.update(id);
        });
    }
}
