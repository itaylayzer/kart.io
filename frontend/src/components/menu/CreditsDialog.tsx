import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
interface CreditsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function CreditItem({
    title,
    author,
    link,
}: {
    title: string;
    author: string;
    link: string;
}) {
    return (
        <div className="flex flex-col">
            <span className="font-semibold text-center text-zinc-300 text-sm">
                {title}
            </span>
            <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-center text-zinc-500 hover:text-white transition-colors"
            >
                {author}
            </a>
        </div>
    );
}

export default function CreditsDialog({
    open,
    onOpenChange,
}: CreditsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="text-center pb-6 px-8 pt-8 border-b border-zinc-800/50 shrink-0">
                    <DialogTitle className="text-3xl font-thin uppercase tracking-[0.2em] text-white">
                        Credits
                    </DialogTitle>
                    <DialogDescription className="font-mono mt-4 text-zinc-500">
                        without your creations, this game wouldn&apos;t have
                        been made
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 custom-scrollbar">
                    <div className="space-y-4 max-w-md mx-auto">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2 text-center">
                            Map Design
                        </h3>
                        <div className="space-y-2 text-center">
                            <a
                                href="https://hofk.de/main/discourse.threejs/2021/CarRacing/CarRacing.html"
                                target="_blank"
                                rel="noreferrer"
                                className="block text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                CarRacing (Base)
                            </a>
                            <a
                                href="https://codesandbox.io/p/sandbox/eager-ganguly-x4fl4"
                                target="_blank"
                                rel="noreferrer"
                                className="block text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Water Shader
                            </a>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md mx-auto">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2 text-center">
                            3D Models
                        </h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 justify-center align-center">
                            <CreditItem
                                title="Kart"
                                author="@Gyro"
                                link="https://sketchfab.com/3d-models/kart-cf740a3e6ba2430497c2b0e15f93c5eb"
                            />
                            <CreditItem
                                title="Banana"
                                author="@Andrew Sink"
                                link="https://sketchfab.com/3d-models/low-poly-banana-ce5f751cf8044affaef94d79f0057f5d"
                            />
                            <CreditItem
                                title="Rocket Ship"
                                author="@Billy Jackman"
                                link="https://sketchfab.com/3d-models/rocket-ship-low-poly-96858de4225f42048c88be630697f9cb"
                            />
                            <CreditItem
                                title="Blue Shell"
                                author="@Billy Jackman"
                                link="https://sketchfab.com/3d-models/blue-shell-low-poly-mario-kart-fan-art-0ad22e1cab6e422e804e9190e370ef64"
                            />
                            <CreditItem
                                title="Turbo"
                                author="@JiggleSticks"
                                link="https://sketchfab.com/3d-models/turbo-low-poly-4cf8772822d84ed4aa4d63f4377de745"
                            />
                            <CreditItem
                                title="Mushroom"
                                author="@GGklin"
                                link="https://sketchfab.com/3d-models/low-poly-mushroom-b8e7ee500c5b4432bf381e1ca00cc135"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md mx-auto">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2 text-center">
                            Assets
                        </h3>
                        <div className="space-y-2 text-center">
                            <p className="text-sm text-zinc-400">
                                Signika Font (@google-fonts)
                            </p>
                            <p className="text-sm text-zinc-400">
                                New Super Mario Font U
                            </p>
                            <a
                                href="https://hofk.de/main/discourse.threejs/2021/CarRacing/CentralMarking.png"
                                target="_blank"
                                rel="noreferrer"
                                className="block text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Road Texture
                            </a>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md mx-auto">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2 text-center">
                            Music
                        </h3>
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2 text-center">
                            By Zane Little Music
                        </p>
                        <div className="flex justify-center gap-6">
                            <a
                                href="https://opengameart.org/content/barriers"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-zinc-400 hover:text-white transition-colors"
                            >
                                Barriers
                            </a>
                            <a
                                href="https://opengameart.org/content/rhythm-factory"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-zinc-400 hover:text-white transition-colors"
                            >
                                Rhythm Factory
                            </a>
                            <a
                                href="https://opengameart.org/content/apple-cider"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-zinc-400 hover:text-white transition-colors"
                            >
                                Apple Cider
                            </a>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
