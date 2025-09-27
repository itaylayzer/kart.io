import { ItemModel } from "../player/ItemModel";
import { Global } from "../store/Global";
import { Player } from "../player/Player";
import { CS } from "../store/codes";
import { PlayerModel } from "../player/PlayerModel";

const itemsMeshes = [
    ItemModel.banana,
    ItemModel.boots,
    ItemModel.rocket,
    ItemModel.wheels,
    ItemModel.mushroom,
];

export class ItemController {
    public setItem: (itemNumber: number) => void;

    public update: () => void;
    constructor(model: PlayerModel, player: Player, isLocal: boolean) {
        let itemIndex = 0;
        let upperItem: ItemModel | null = null;
        this.update = () => {
            if (
                isLocal &&
                upperItem !== null &&
                !Global.mouseController.isLocked &&
                Global.mouseController.isMouseDown(0) &&
                !upperItem.stopping
            ) {
                model.remove(upperItem!);
                upperItem = null;
                const data = [itemIndex];

                if ([0, 2, 3].includes(itemIndex)) {
                    data.push(
                        player.position.x,
                        player.position.y,
                        player.position.z
                    );
                }

                if ([2, 3].includes(itemIndex)) {
                    data.push(
                        player.quaternion.x,
                        player.quaternion.y,
                        player.quaternion.z,
                        player.quaternion.w
                    );
                }

                Global.client.send(CS.APPLY_MYSTERY, data);
            }
            upperItem?.update();
        };
        this.setItem = (num) => {
            if (upperItem !== null) return;
            upperItem = new ItemModel(itemsMeshes[(itemIndex = num)]);
            model.add(upperItem);
        };
    }
}
