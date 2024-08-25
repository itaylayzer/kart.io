import { Player } from "./Player";

export class OnlinePlayer extends Player {
   
    constructor(id: number, name: string) {
        super(id, name, "#ff0000");
    }
}
