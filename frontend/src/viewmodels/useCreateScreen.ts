import { createVectorsFromNumbers } from "@/game/api/setup/road";
import { renderMap } from "@/game/player/WorldMap";
import { useRouter } from "next/router";
import { createRef, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CatmullRomCurve3 } from "three";
import { curvePoints } from "@shared/config/road";
import { useRoom } from "@/hooks/useRoom";

export const useCreateScreen = () => {
    const router = useRouter();

    const [roomName, setRoomName] = useState<string>("");
    const [roomPassword, setRoomPassword] = useState<string>("");
    const [roomMap, setRoomMap] = useState<number>(0);

    const [room, setRoom] = useRoom();
    const roomMapCanvasRef = createRef<HTMLCanvasElement>();

    async function createRoom() {
        try {
            const response = await colyseus.http.post<string>('rooms/kart_race', {
                body: {
                    roomName: roomName,
                    mapId: roomMap,
                    password: roomPassword
                }
            });

            setRoom(
                response.data,
                roomName,
                roomPassword.length > 0,
                roomPassword,
            );
            router.push(`/room/${response.data}`);

        } catch (err) {
            toast("Cannot Connect", {
                type: "error",
            });
            router.push('/');
        }
    }
    useEffect(() => {
        if (roomMapCanvasRef.current === null) return;
        renderMap(
            new CatmullRomCurve3(
                createVectorsFromNumbers(curvePoints[roomMap])
            ),
            roomMapCanvasRef.current!,
            500
        );
    }, [roomMapCanvasRef.current, roomMap]);

    return {
        room,
        createRoom,
        setRoomName,
        setRoom,
        setRoomPassword,
        roomMap,
        setRoomMap,
        roomMapCanvasRef,
        roomName,
        roomPassword,
        router
    };

}