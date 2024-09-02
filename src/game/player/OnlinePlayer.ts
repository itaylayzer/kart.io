import { IKeyboardController } from "../controller/IKeyboardController";
import { Player } from "./Player";

export class OnlinePlayer extends Player {
  constructor(id: number, name: string, color:number) {
    super(id, false, name, color, new IKeyboardController());
  }
}
