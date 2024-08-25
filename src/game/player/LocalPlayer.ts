import { Player } from "./Player";
import { getNameFromURL } from "../api/getNameFromURL";

export class LocalPlayer extends Player {
  private static instance: LocalPlayer;
  static getInstance() {
    return this.instance;
  }
  constructor(pid: string) {
    super(pid, getNameFromURL(), "#124eb5");
    LocalPlayer.instance = this;
  }

  public register() {}
}
