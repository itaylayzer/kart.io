import { KartRaceState } from "@schema/KartRaceState";
import { Room } from "colyseus.js";

export type KartClient = Room<KartRaceState>;