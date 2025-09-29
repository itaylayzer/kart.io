import { useEffect } from "react";
import { useAssetStore } from "../store/useAssetLoader";
import { assetsList } from "@/config/assetsList";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/components/ui/utils";

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
        <Progress
            value={Math.min(progress, 1) * 100}
            className={cn(
                "mt-2 w-[52.13vh] transition-opacity duration-1000",
                progress <= 1 ? "opacity-20" : "opacity-0"
            )}
        />
    );
}
