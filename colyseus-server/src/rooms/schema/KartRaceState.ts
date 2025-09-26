import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";


export class VectorSchema extends Schema {
  @type("float32") x: number;
  @type("float32") y: number;
  @type("float32") z: number;
}

export class PlayerSchema extends Schema {
  @type("boolean") ready = false;
  @type("string") name = "Guest";
  @type("uint8") color: number = 0;
  @type("string") id: string = "-1";
}

export class MysteryBoxSchema extends Schema {
  @type("uint8") index: number;
  @type(VectorSchema) position: VectorSchema;
  @type("boolean") visible: boolean = true;
}

export class KartRaceState extends Schema {
  @type("uint8") mapId: number = 0;
  @type("number") startTime: number = 0;
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
  @type({ array: MysteryBoxSchema }) mysteries = new ArraySchema<MysteryBoxSchema>();
}
