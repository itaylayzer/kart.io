import { Player } from "./Player";
import { getNameFromURL } from "../api/getNameFromURL";
import { KeyboardController } from "../controller/KeyboardController";

export class LocalPlayer extends Player {
  private static instance: LocalPlayer;
  static getInstance() {
    return this.instance;
  }
  constructor(id: number) {
    super(id, true, getNameFromURL(), new KeyboardController());

    LocalPlayer.instance = this;
  }
}
