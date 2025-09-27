import * as CANNON from "cannon-es";

export const colors = {
    background: "#77b5f7",
    black: "#1a1a1a",
    white: "#e0e0e0",
    boardWhite: "#e0e0e0",
};

export const player = new CANNON.Material({ friction: 0, restitution: 0 });
export const ground = new CANNON.Material({ friction: 0, restitution: 0 });
export const contanct = new CANNON.ContactMaterial(player, ground, {
    friction: 0,
    restitution: 0,
});

export const FOG = [
    [50, 10, 20],
    [80, 20, 40],
    [130, 40, 60],
    [150, 60, 80],
]