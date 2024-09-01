import { ReactNode, useEffect } from "react";
import { useAssetStore } from "../viewmodels/useAssetLoader";

export default function AssetLoader({
  children,
  items,
}: {
  children: ReactNode;
  items?: Record<string, string> | undefined;
}) {
  const { progress, skipAssets, loadMeshes } = useAssetStore();

  useEffect(() => {
    if (items === undefined) {
      skipAssets();
    } else loadMeshes(items).catch((r) => console.error(r));

    return () => {};
  }, []);

  return progress >= 2 ? (
    children
  ) : (
    <progress value={progress} max={1}></progress>
  );
}
