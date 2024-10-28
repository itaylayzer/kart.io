import { Socket } from "socket.io";

export function useSockets(players: Map<number, { info: { pid: number, socket: Socket } }>) {
    return {
        emitAll(eventName: string, eventArgs?: any) {
            for (const x of players.values()) {
                x.info.socket.emit(eventName, eventArgs);
            }
        },
        emitExcept(exceptID: number, eventName: string, eventArgs?: any) {
            for (const x of players.values()) {
                x.info.pid !== exceptID && x.info.socket.emit(eventName, eventArgs);
            }
        }
    }
};