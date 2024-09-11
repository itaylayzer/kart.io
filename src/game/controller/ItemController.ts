import { UpperItem } from "../player/UpperItem";
import { Global } from "../store/Global";
import { Player } from "../player/Player";
import { CS } from "../store/codes";
import { Banana } from "../player/Items/Banana";
import { PlayerModel } from "../player/PlayerModel";

const itemsMeshes = [
    UpperItem.banana,
    UpperItem.boots,
    UpperItem.rocket,
    UpperItem.wheels,
];

export class ItemController {
    public setItem: (itemNumber: number) => void;

    public update: () => void;
    constructor(model: PlayerModel, player: Player, isLocal: boolean) {
        let itemIndex = 0;
        let upperItem: UpperItem | null = null;
        this.update = () => {
            if (
                isLocal &&
                upperItem !== null &&
                Global.mouseController.isMouseDown(0) &&
                !upperItem.stopping
            ) {
                model.remove(upperItem!);
                upperItem = null;
                const data = [itemIndex];

                if (itemIndex === 0) {
                    new Banana(player.id, player.position);
                    data.push(
                        player.position.x,
                        player.position.y,
                        player.position.z
                    );
                }
                Global.socket?.emit(CS.APPLY_MYSTERY, data);
            }
            upperItem?.update();
        };
        this.setItem = (num) => {
            if (upperItem !== null) return;
            upperItem = new UpperItem(itemsMeshes[(itemIndex = num)]);
            model.add(upperItem);
        };
    }
}
