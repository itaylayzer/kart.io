import AssetLoader from "@/components/AssetLoader";
import { AudioContainer } from "@/lib/AudioContainer";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export default function () {
    const router = useRouter();
    const goBack = () => {
        router.push("/");
    };
    return (
        <>
            <header>
                <AssetLoader />
            </header>
            <AudioContainer />

            <main>
                <h1 style={{ fontSize: "6.25vh", marginBottom: 0 }}>credits</h1>
                <center>
                    <p
                        style={{
                            marginTop: 0,
                            marginBottom: 20,
                            fontFamily: "monospace",
                            fontWeight: 300,
                        }}
                    >
                        without your creations, this game wasn't been made
                    </p>
                </center>
                <div
                    style={{
                        display: "block",
                        maxHeight: "50vh",
                        overflowY: "scroll",
                    }}
                >
                    <h3> road </h3>
                    <p>
                        https://hofk.de/main/discourse.threejs/2021/CarRacing/CarRacing.html
                    </p>
                    <h3>water</h3>
                    <p>
                        https://codesandbox.io/p/sandbox/eager-ganguly-x4fl4?file=%2Fsrc%2Findex.js%3A99%2C47
                    </p>
                    <h3> sketchfab </h3>
                    <p>
                        @Gyro - Kart <br />
                        https://sketchfab.com/3d-models/kart-cf740a3e6ba2430497c2b0e15f93c5eb#download
                    </p>
                    <br />
                    <p>
                        @Andrew Sink - Low Poly Banana
                        <br />
                        https://sketchfab.com/3d-models/low-poly-banana-ce5f751cf8044affaef94d79f0057f5d
                    </p>

                    <br />
                    <p>
                        @Billy Jackman - Rocket Ship - Low Poly
                        <br />
                        https://sketchfab.com/3d-models/rocket-ship-low-poly-96858de4225f42048c88be630697f9cb
                    </p>

                    <br />
                    <p>
                        @Billy Jackman - Blue Shell - Low Poly Mario Kart Fan
                        Art
                        <br />
                        https://sketchfab.com/3d-models/blue-shell-low-poly-mario-kart-fan-art-0ad22e1cab6e422e804e9190e370ef64
                    </p>

                    <br />
                    <p>
                        @JiggleSticks - Turbo - Low Poly
                        <br />
                        https://sketchfab.com/3d-models/turbo-low-poly-4cf8772822d84ed4aa4d63f4377de745
                    </p>
                    <br />
                    <p>
                        @GGklin - Low Poly Mushroom
                        <br />
                        https://sketchfab.com/3d-models/low-poly-mushroom-b8e7ee500c5b4432bf381e1ca00cc135
                    </p>
                    <h3> textures </h3>
                    <p>
                        txt_road =
                        https://hofk.de/main/discourse.threejs/2021/CarRacing/CentralMarking.png
                    </p>
                    <h3> fonts </h3>
                    <p> Signika - @google-fonts </p>
                    <p>
                        New Super Mario Font U -
                        https://www.cdnfonts.com/new-super-mario-font-u.font
                    </p>
                    <h3>Music by Zane Little Music</h3>
                    <p>barriers - https://opengameart.org/content/barriers</p>
                    <p>
                        rhythm factory -
                        https://opengameart.org/content/rhythm-factory
                    </p>
                    <p>
                        apple cider -
                        https://opengameart.org/content/apple-cider
                    </p>
                </div>
                <br />
                <center>
                    <Button
                        className="min-w-[8rem]"
                        onClick={() => {
                            goBack();
                        }}
                    >
                        back
                    </Button>
                </center>
            </main>
        </>
    );
}
