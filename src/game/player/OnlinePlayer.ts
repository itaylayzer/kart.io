import { IKeyboardController } from "../controller/IKeyboardController";
import { Player } from "./Player";

export class OnlinePlayer extends Player {
  constructor(id: number, name: string) {
    super(id, false, name, new IKeyboardController());
  }
}
