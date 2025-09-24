import { useSettingsStore } from "@/store/useSettingsStore";
import { Button } from "@mui/material";
import {
    createRef,
    Dispatch,
    forwardRef,
    RefObject,
    SetStateAction,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import AudioVisual from "react-audio-visual";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";

type AudioRef = {
    play: (name: [string, string], link: string) => void;
    setVisible: (visible: boolean) => void;
    setCentered: Dispatch<SetStateAction<boolean>>;
};

class AudioHolder {
    public static audioRef: RefObject<AudioRef>;
}

const AudioHTML = forwardRef<AudioRef, {}>((_, ref) => {
    const { masterVolume, musicVolume, displayAudio } = useSettingsStore();

    const [name, setName] = useState<[string, string]>();
    const [visible, setVisible] = useState<boolean>(true);
    const [centered, setCentered] = useState<boolean>(false);
    const [playing, setPlaying] = useState(true);

    const audioRef = createRef<HTMLAudioElement>();

    useImperativeHandle(ref, () => ({
        play(name, link) {
            setName(name);
            audioRef.current!.src = link;
            audioRef.current!.volume = masterVolume * musicVolume;
            audioRef.current!.play();
            audioRef.current!.loop = true;
            setPlaying(true);
        },
        setVisible(visible) {
            setVisible(visible);
        },
        setCentered,
    }));

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = masterVolume * musicVolume;
        }
    }, [masterVolume, musicVolume]);

    const height = 60;

    return (
        <>
            <audio ref={audioRef}></audio>
            {name === undefined ? (
                <></>
            ) : (
                <div
                    id="audio"
                    data-tooltip-id="t"
                    data-tooltip-content={`${name[0]} by ${name[1]}`}
                    style={{
                        opacity: +(visible && displayAudio),
                        left: [20, "50%"][+centered],
                        translate: `${[0, -50][+centered]}% 0%`,
                        transformOrigin: ["bottom left", "center center"][
                            +centered
                        ],
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            zIndex: 10,
                            width: "22.419vh",
                            height: height,
                            paddingTop: 60 - height,
                            opacity: 0.1 * +playing,
                            pointerEvents: "none",
                            transition: "opacity .2s",
                        }}
                    >
                        <AudioVisual
                            colors={["white"]}
                            barInternal={10}
                            barSpace={4}
                            capHeight={0}
                            audio={audioRef}
                        />
                    </div>
                    <div style={{ display: "flex", height: 60 }}>
                        <p
                            style={{
                                marginBlock: "auto",
                                fontFamily: "Signika",
                                fontWeight: 500,
                                fontSize: "2.6vh",
                                paddingLeft: 10,
                                translate: "0px -3px",
                                flexGrow: 1,
                            }}
                        >
                            {name[0]}
                        </p>
                        <Button
                            onClick={() => {
                                if (audioRef.current!.paused) {
                                    audioRef.current!.play();
                                    setPlaying(true);
                                } else {
                                    audioRef.current!.pause();
                                    setPlaying(false);
                                }
                            }}
                            style={{
                                marginBlock: "auto",
                                marginRight: 20,
                                cursor: "pointer",
                            }}
                        >
                            {[FaPlay, FaPause][+playing]({
                                size: 18,
                                color: "white",
                                style: {
                                    marginBlock: "auto",
                                },
                            })}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
});

export const AudioContainer = () => {
    const ref = createRef<AudioRef>();
    // @ts-ignore
    AudioHolder.audioRef = ref;

    return <AudioHTML ref={ref}></AudioHTML>;
};

export const audio = () => AudioHolder.audioRef!.current!;
