import * as THREE from "three";
import { Global } from "../store/Global";
import clamp from "../api/clamp";

export class AudioController {
  public static listener: THREE.AudioListener;

  public static update: (
    speed: number,
    quaternion: THREE.QuaternionLike,
    position: THREE.Vector3Like
  ) => void;

  public static localUpdate: (
    quaternion: THREE.QuaternionLike,
    position: THREE.Vector3Like
  ) => void;

  public static playerPos: THREE.Vector3;

  public static init() {
    this.playerPos = new THREE.Vector3();
    Global.camera.add((this.listener = new THREE.AudioListener()));
    this.listener.setMasterVolume(
      30 * Global.settings.masterVolume * Global.settings.sfxVolume
    );
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

    for (const clip of clips) {
      clip.play();
      clip.setLoop(true);
    }
    this.localUpdate = (quaternion, position) => {
      this.playerPos.copy(position);
      this.listener.position.copy(this.playerPos);
      this.listener.quaternion.copy(quaternion);
    };
    this.update = (speed, quaternion, position) => {
      try {
        for (const clip of clips) {
          clip.position.copy(position);
          clip.quaternion.copy(quaternion);
          //   clip.setRefDistance(
          //     100 / new THREE.Vector3().copy(position).distanceTo(this.playerPos)
          //   );
        }
        clips[0].setVolume(clamp((-speed + 5) / 10, 0, 1));
        clips[1].setVolume(clamp((speed < 5 ? speed : 10 - speed) / 7, 0, 1));
        clips[2].setVolume(clamp((speed - 5) / 5, 0, 1));
      } catch {}
    };
  }
}
