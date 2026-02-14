export class StartTimer {
    public static locked: boolean;
    static start(startTime: number) {
        this.locked = true;

        const now = Date.now();
        // Guard: if startTime is in the past or invalid (race with state sync), use now + 5s
        const effectiveStart = startTime > now ? startTime : now + 5000;

        const schedule = (fn: () => void, delay: number) => {
            const clamped = Math.max(0, delay);
            if (clamped > 0) {
                setTimeout(fn, clamped);
            } else {
                fn();
            }
        };

        const startAnimation = (text: string) => {
            const el = document.querySelector("#start-timer") as HTMLElement;
            if (!el?.children[0]) return;
            el.children[0].innerHTML = text;
            el.style.opacity = "1";
            el.style.visibility = "visible";
            el.style.animationName = "startAnim";
            el.style.animationTimingFunction = "ease-out";
            el.style.animationDuration = "0.7s";
            el.style.animationFillMode = "forwards";
            setTimeout(() => {
                el.style.animation = "none";
                el.style.opacity = "0";
                el.style.visibility = "hidden";
            }, 900);
        };

        const runCountdown = () => {
            schedule(() => startAnimation("3"), effectiveStart - Date.now() - 3000);
            schedule(() => startAnimation("2"), effectiveStart - Date.now() - 2000);
            schedule(() => startAnimation("1"), effectiveStart - Date.now() - 1000);
            schedule(() => {
                startAnimation("Go!");
                this.locked = false;
            }, effectiveStart - Date.now());
        };

        // Wait for #start-timer to exist (React may not have committed DOM yet)
        const tryRun = () => {
            if (document.querySelector("#start-timer")) {
                runCountdown();
            } else {
                requestAnimationFrame(tryRun);
            }
        };
        requestAnimationFrame(tryRun);
    }
}
