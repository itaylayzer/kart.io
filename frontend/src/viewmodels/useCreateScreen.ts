import { useRouter } from "next/router";
import { createRef, useState } from "react";
import { toast } from "sonner";
import { useRoom } from "@/hooks/useRoom";

export const useCreateScreen = () => {
    const router = useRouter();

    const [roomName, setRoomName] = useState<string>("");
    const [roomPassword, setRoomPassword] = useState<string>("");
    const [roomMap, setRoomMap] = useState<number>(0);
    const [roomVisible, setRoomVisible] = useState<boolean>(true);

    const [room, setRoom] = useRoom();
    const roomMapCanvasRef = createRef<HTMLCanvasElement>();

    async function createRoom() {
        try {
            const response = await colyseus.http.post<string>('rooms/kart_race', {
                body: {
                    roomName: roomName,
                    mapId: roomMap,
                    password: roomPassword,
                    visible: roomVisible
                }
            });

            setRoom(
                response.data,
                roomName,
                roomPassword.length > 0,
                roomPassword,
            );
            router.push(`/play/${response.data}`);

        } catch (err) {
            toast.error("Cannot Connect");
            router.push('/');
        }
    }

    return {
        room,
        createRoom,
        setRoomName,
        setRoom,
        setRoomPassword,
        setRoomVisible,
        roomMap,
        setRoomMap,
        roomMapCanvasRef,
        roomName,
        roomPassword,
        roomVisible,
        router
    };

}