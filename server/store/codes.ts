// server codes
export enum CS {
    JOIN = "j",
    UPDATE = "u",
    KEY_DOWN = "d",
    KEY_UP = "u",
    TOUCH_MYSTERY = "t",
    READY = "r",
    INIT_GAME = "g",
    APPLY_MYSTERY = "a",
    UPDATE_TRANSFORM = "f",
    FINISH_LINE = "l",
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
}
