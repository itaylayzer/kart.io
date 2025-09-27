export interface RoomData {
    /**
     * Unique identifier for the room.
     */
    roomId: string;
    /**
     * Number of clients connected to this room.
     */
    clients: number;
    /**
     * Maximum number of clients allowed to join the room.
     */
    maxClients: number;
    /**
     * Indicates if the room is locked (i.e. join requests are rejected).
     */
    locked: boolean;
    /**
     * Indicates if the room is private
     * Private rooms can't be joined via `join()` or `joinOrCreate()`.
     */
    private: boolean;
    /**
     * Room name.
     */
    name: string;
    /**
     * Public address of the server.
     */
    publicAddress?: string;
    /**
     * Process id where the room is running.
     */
    processId: string;
    /**
     * Do not show this room in lobby listing.
     */
    unlisted: boolean;
    /**
     * Metadata associated with the room.
     */
    metadata: any;
    /**
     * Additional custom properties
     */
    [property: string]: any;
}