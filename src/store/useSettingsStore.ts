import { toast } from "react-toastify";
import { create } from "zustand";

export type settingsType = {
  useArrow: boolean;
  fovChange: number; // between 0 to 1
  masterVolume: number; // between 0 to 1
  musicVolume: number;
  sfxVolume: number;
  useBloom: boolean;
  displaySun: boolean;
  displayVelocity: boolean;
  renderColliders: boolean;
  Antialiasing: boolean;
  displayAudio: boolean;
  fps: number;
  useSTATS: boolean;
};

const defualtValue: settingsType = {
  useArrow: false,
  fovChange: 0.5,
  masterVolume: 0.5,
  useBloom: true,
  displaySun: true,
  renderColliders: false,
  displayVelocity: true,
  Antialiasing: true,
  musicVolume: 0.5,
  sfxVolume: 1,
  displayAudio: true,
  fps: 60,
  useSTATS: false,
};

type SettingsStore = settingsType & {
  set: (
    partial:
      | settingsType
      | Partial<settingsType>
      | ((state: settingsType) => settingsType | Partial<settingsType>),
    replace?: boolean | undefined
  ) => void;
  loadFromCookies: (dotoast: boolean) => void;
  saveToCookies: (dotoast: boolean) => void;
  reset: () => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...defualtValue,
  set,
  loadFromCookies(dotoast = false) {
    const storedSettings = document.cookie
      .split("; ")
      .find((row) => row.startsWith("settings="))
      ?.split("=")[1];

    if (storedSettings) {
      set(JSON.parse(decodeURIComponent(storedSettings)));
      dotoast && toast("Loaded", { type: "success" });
    }
  },

  saveToCookies(dotoast = false) {
    set((state) => {
      document.cookie = `settings=${encodeURIComponent(
        JSON.stringify(state)
      )}; path=/; max-age=31536000`; // 1 year expiry

      dotoast && toast("Saved", { type: "success" });

      return state;
    });
  },
  reset() {
    set(defualtValue);
  },
}));
