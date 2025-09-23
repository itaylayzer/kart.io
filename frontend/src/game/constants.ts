import * as CANNON from "cannon-es";

export const colors = {
    background: "#0a0a0a",
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
