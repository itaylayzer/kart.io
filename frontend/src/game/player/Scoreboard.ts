import { TrackerController } from "../controller/TrackerController";
import { Global } from "../store/Global";
import { LocalPlayer } from "./LocalPlayer";

export class Scoreboard {
    public static finishMacth: boolean;
    static {
        this.finishMacth = false;
    }
    public update: () => void;
    constructor() {
        const tableHTML = document.querySelector(
            "table#scoreboard"
        )! as HTMLTableElement;

        const parent = tableHTML.parentElement!;

        const scoreboard_finish_elements = Array.from(
            parent.querySelectorAll(".scoreboard_finish")
        ) as HTMLElement[];
        (
            parent.querySelector(
                "button.scoreboard_finish"
            ) as HTMLButtonElement
        ).onclick = () => {
            Global.goBack();
        };
        this.update = () => {
            const showing =
                Scoreboard.finishMacth ||
                (Global.lockController.isLocked &&
                    (Global.mouseController.isMousePressed(2) ||
                        LocalPlayer.getInstance().keyboard.isKeyPressed(-5)));
            parent.parentElement!.style.visibility = ["hidden", "visible"][
                +showing
            ];
            parent.parentElement!.style.backgroundColor = `rgba(8,8,8,${
                (+showing + +Scoreboard.finishMacth) / 2
            })`;
            parent.parentElement!.style.pointerEvents = ["none", "all"][
                +showing
            ];

            tableHTML.innerHTML = `<tr><th>Name</th><th>Location</th><th>Round</th></tr>`;

            scoreboard_finish_elements.map((v) => {
                v.style.display = ["none", "block"][+Scoreboard.finishMacth];
            });

            const scoreboardInformations = TrackerController.getScoreboard();

            for (const playerInfo of scoreboardInformations) {
                tableHTML.innerHTML += `<tr><td style="color:${playerInfo[0]};">${playerInfo[1]}</td><td>${playerInfo[2]}</td><td>${playerInfo[3]}</td></tr>`;
            }
        };
    }
}
