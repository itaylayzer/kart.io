import { useEffect, useState } from "react";

type StorageRoom = { id: string, name: string, hasPassword: boolean, password: string | undefined }

export const useRoom = () => {
    const [_room, _setRoom] = useState<StorageRoom>();

    const setRoom = (id: string, name: string, hasPassword: boolean, password: string | undefined) => {
        const obj = {
            id, name, hasPassword, password
        } as StorageRoom;
        sessionStorage.setItem('room', JSON.stringify(obj))
        _setRoom(obj);
    }

    useEffect(() => {
        const gather = () => {
            console.log('ss:', sessionStorage)
            const data = sessionStorage.getItem('room');
            if (data === null) return;
            const _room = JSON.parse(data) as StorageRoom;
            _setRoom(_room);
        }
        if (window === undefined || sessionStorage === undefined) setTimeout(() => gather, 50);
        else gather();
    }, [])

    return [_room, setRoom] as [StorageRoom, (id: string, name: string, hasPassword: boolean, password: string | undefined) => void];
}