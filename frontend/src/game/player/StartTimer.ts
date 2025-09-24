export class StartTimer {
    public static locked: boolean;
    static start(startTime: number) {
        this.locked = true;

        const now = new Date().getTime();

        const htmlElement = document.querySelector(
            "#start-timer"
        ) as HTMLElement;

        const animationName = "startAnim";

        const startAnimation = (text: string) => {
            htmlElement.children[0].innerHTML = `${text}`;
            htmlElement.style.animationName = animationName;
            htmlElement.style.animationTimingFunction =
                "cubic-bezier(0.5,0,0,0.5)";
            htmlElement.style.animationDuration = "0.8s";
            setTimeout(() => {
                htmlElement.style.animation = "none";
            }, 800);
        };

        // 3s
        setTimeout(() => {
            startAnimation("3");
        }, startTime - now - 3000);

        // 2s
        setTimeout(() => {
            startAnimation("2");
        }, startTime - now - 2000);

        // 1s
        setTimeout(() => {
            startAnimation("1");
        }, startTime - now - 1000);

        // end
        setTimeout(() => {
            startAnimation("Go!");

            this.locked = false;
        }, startTime - now);
    }
}
