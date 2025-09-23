import { Player } from "./Player";
import { KeyboardController } from "../controller/KeyboardController";
import { TrackerController } from "../controller/TrackerController";
import { Global } from "../store/Global";

export class LocalPlayer extends Player {
    private static instance: LocalPlayer;

    static getInstance() {
        return this.instance;
    }
    constructor(id: number, name: string, color: number) {
        super(id, true, name, color, new KeyboardController());
        LocalPlayer.instance = this;
        Global.lateUpdates.push(() => {
            TrackerController.update(id);
        });
    }
}
