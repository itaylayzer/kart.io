import * as THREE from "three";
import { Global } from "../store/Global";
import clamp from "../api/clamp";

const maxVolume = 0.3;

export class AudioController extends THREE.Group {
    public static listener: THREE.AudioListener;

    public update: (speed: number) => void;

    static {
        const init = () => {
            try {
                this.listener = new THREE.AudioListener();
                this.listener.setMasterVolume(0);
            } catch { setTimeout(init, 50) }
        };
        init();
    }

    public static init() {
        Global.camera.add(this.listener);
        this.listener.setMasterVolume(
            maxVolume * Global.settings.masterVolume * Global.settings.sfxVolume
        );
    }

    constructor() {
        super();
        const clips = [
            new THREE.PositionalAudio(AudioController.listener).setBuffer(
                Global.assets.sfx.sfx_slow
            ),
            new THREE.PositionalAudio(AudioController.listener).setBuffer(
                Global.assets.sfx.sfx_avg
            ),
            new THREE.PositionalAudio(AudioController.listener).setBuffer(
                Global.assets.sfx.sfx_fast
            ),
        ];

        for (const c of clips) {
            c.setLoop(true);
            c.position.set(0, 0, 0);
            c.play();
        }

        const updateVolumes = (speed: number) => {
            clips[0].setVolume(
                (clamp(speed, 0, 1) * 0.5 + 0.5) *
                clamp((-speed + 5) / 10, 0, 1)
            );
            clips[1].setVolume(
                clamp((speed < 5 ? speed : 10 - speed) / 7, 0, 1)
            );
            clips[2].setVolume(clamp((speed - 5) / 5, 0, 1));
        };

        updateVolumes(0);

        this.update = (speed) => {
            updateVolumes(speed);
        };

        super.add(...clips);
    }
}
