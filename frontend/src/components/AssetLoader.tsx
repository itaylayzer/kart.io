import { ReactNode, useEffect } from "react";
import { useAssetStore } from "../store/useAssetLoader";
import { LinearProgress } from "@mui/material";
import { assetsList } from "@/config/assetsList";

export default function AssetLoader() {
    const { progress, skipAssets, loadMeshes } = useAssetStore();

    useEffect(() => {
        console.log("assets loader: use effect", progress);
        if (assetsList === undefined) {
            console.log("assets loader: load assets");
            skipAssets();
        } else if (progress === 0)
            loadMeshes(assetsList).catch((r) => console.error(r));

        return () => {};
    }, []);

    return (
        <LinearProgress
            style={{
                width: "52.13vh",
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
