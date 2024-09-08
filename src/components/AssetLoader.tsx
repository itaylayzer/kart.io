import { ReactNode, useEffect } from "react";
import { useAssetStore } from "../store/useAssetLoader";
import { LinearProgress } from "@mui/material";

export default function AssetLoader({
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

  return (
    <LinearProgress
      style={{
        width: 500,
        marginTop: 10,
        opacity: 0.2 * +(progress <= 1),
        transition: "opacity 1s ease-out",
      }}
      variant="determinate"
      color="inherit"
      value={Math.min(progress, 1) * 100}
    />
  );
}
