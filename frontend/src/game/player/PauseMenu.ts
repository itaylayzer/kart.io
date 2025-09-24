import { audio } from "@/lib/AudioContainer";
import { Global } from "../store/Global";
import { Scoreboard } from "./Scoreboard";

export class PauseMenu {
    constructor() {
        const pauseMenu = document.querySelector(
            "div#pauseMenu"
        )! as HTMLTableElement;

        const resumeButton = pauseMenu.querySelector(
            "button#resume"
        ) as HTMLButtonElement;
        const disconnectButton = pauseMenu.querySelector(
            "button#disconnect"
        ) as HTMLButtonElement;

        resumeButton.onclick = () => {
            Global.lockController.lock();
        };
        disconnectButton.onclick = () => {
            Global.goBack();
        };

        let lastShowing = false;
        audio().setCentered(true);
        audio().setVisible(false);

        Global.updates.push(() => {
            const showing = Scoreboard.finishMacth
                ? false
                : !Global.lockController.isLocked;

            if (lastShowing !== showing) {
                audio().setVisible(showing);
            }

            pauseMenu.style.visibility = ["hidden", "visible"][+showing];
            pauseMenu.style.pointerEvents = ["none", "all"][+showing];

            lastShowing = showing;
        });
    }
}
