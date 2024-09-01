import { create } from "zustand";

export type settingsType = {
  useArrow: boolean;
  fovChange: number; // between 0 to 1
  masterVolume: number; // between 0 to 1
  useBloom: boolean;
  displaySun: boolean;
  renderColliders: boolean;
};

const defualtValue: settingsType = {
  useArrow: false,
  fovChange: 0.5,
  masterVolume: 1,
  useBloom: true,
  displaySun: true,
  renderColliders: false,
};

type SettingsStore = settingsType & {
  set: (
    partial:
      | settingsType
      | Partial<settingsType>
      | ((state: settingsType) => settingsType | Partial<settingsType>),
    replace?: boolean | undefined
  ) => void;
  loadFromCookies: () => void;
  saveToCookies: () => void;
  reset: () => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...defualtValue,
  set,
  loadFromCookies() {
    const storedSettings = document.cookie
      .split("; ")
      .find((row) => row.startsWith("settings="))
      ?.split("=")[1];

    if (storedSettings) {
      set(JSON.parse(decodeURIComponent(storedSettings)));
    }
  },

  saveToCookies() {
    set((state) => {
      document.cookie = `settings=${encodeURIComponent(
        JSON.stringify(state)
      )}; path=/; max-age=31536000`; // 1 year expiry
      return state;
    });
  },
  reset() {
    set(defualtValue);
  },
}));
