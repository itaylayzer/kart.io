import { Player } from "./Player";

export class OnlinePlayer extends Player {
   
    constructor(id: string, name: string) {
        super(id, name, "#ff0000");
    }
}
