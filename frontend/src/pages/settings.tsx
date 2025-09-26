import { Settings } from "@/app/Settings";
import AssetLoader from "@/components/AssetLoader";
import { AudioContainer } from "@/lib/AudioContainer";
import { useRouter } from "next/router";

export default function () {
    const router = useRouter();
    return (
        <>
            <header>
                <AssetLoader />
            </header>
            <AudioContainer />

            <Settings
                goBack={() => {
                    router.push("/");
                }}
            />
        </>
    );
}
