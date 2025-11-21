// server codes
export enum CS {
    UPDATE = "u",
    KEY_DOWN = "d",
    KEY_UP = "u",
    TOUCH_MYSTERY = "t",
    READY = "r",
    INIT_GAME = "g",
    APPLY_MYSTERY = "a",
    UPDATE_TRANSFORM = "f",
    FINISH_LINE = "l",
    INPUT_BUFFER = "b",  // Input buffer for authoritative movement
}

// client codes
export enum CC {
    INIT = "i",
    INIT_GAME = "g",
    NEW_PLAYER = "p",
    DISCONNECTED = "d",
    KEY_DOWN = "d",
    KEY_UP = "u",
    MYSTERY_VISIBLE = "m",
    READY = "r",
    START_GAME = "s",
    MYSTERY_ITEM = "y",
    APPLY_MYSTERY = "a",
    SHOW_WINNERS = "w",
    UPDATE_TRANSFORM = "f",
    FINISH_LINE = "l",
    STATE_BUFFER = "x",  // State buffer for authoritative movement
    POSITION_UPDATE = "p",  // Position update for other players
}
