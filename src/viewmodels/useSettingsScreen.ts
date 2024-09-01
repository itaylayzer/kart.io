import { useEffect } from "react";
import { useSettingsStore } from "../store/useSettingsStore";

export function useSettingsScreen() {
  const settingsStore =
    useSettingsStore();

    useEffect(() => {
        settingsStore.loadFromCookies();
      }, []);
    
  return settingsStore;
}
