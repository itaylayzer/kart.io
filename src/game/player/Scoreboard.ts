import { TrackerController } from "../controller/TrackerController";
import { Global } from "../store/Global";

export class Scoreboard {
  public update: () => void;
  constructor() {
    const tableHTML = document.querySelector(
      "table#scoreboard"
    )! as HTMLTableElement;

    this.update = () => {
      const showing =
        Global.lockController.isLocked &&
        Global.mouseController.isMousePressed(2);
      tableHTML.style.visibility = ["hidden", "visible"][+showing];
      tableHTML.style.pointerEvents = ["none", "all"][+showing];

      tableHTML.innerHTML = `<tr><th>Name</th><th>Location</th><th>Round</th></tr>`;

      const scoreboardInformations = TrackerController.getScoreboard();

      for (const playerInfo of scoreboardInformations) {
        tableHTML.innerHTML += `<tr><td>${playerInfo[0]}</td><td>${playerInfo[1]}</td><td>${playerInfo[2]}</td></tr>`;
      }
    };
  }
}
