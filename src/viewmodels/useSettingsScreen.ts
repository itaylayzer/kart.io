import { useState } from "react";
import { useSettingsStore } from "../store/useSettingsStore";

export function useSettingsScreen() {
  const [nav, setNav] = useState<number>(0);
  const settingsStore = useSettingsStore();

  return { ...settingsStore, nav, setNav };
}
