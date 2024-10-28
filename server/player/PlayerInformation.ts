import { Socket } from "socket.io";

export interface PlayerInformation {
    socket: Socket;
    pid: number;
    name: string;
    transform: number[];
    color: number;
    ready: boolean;
    finish: boolean;
};