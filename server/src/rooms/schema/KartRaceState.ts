import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

export class VectorSchema extends Schema {
  @type("float32") x: number = 0;
  @type("float32") y: number = 0;
  @type("float32") z: number = 0;
}

export class QuaternionSchema extends Schema {
  @type("float32") x: number = 0;
  @type("float32") y: number = 0;
  @type("float32") z: number = 0;
  @type("float32") w: number = 0;
}

export class TransformSchema extends Schema {
  @type(VectorSchema) position: VectorSchema = new VectorSchema();
  @type(QuaternionSchema) quaternion: QuaternionSchema =
    new QuaternionSchema();
}

export class PlayerSchema extends Schema {
  @type("boolean") ready = false;
  @type("string") name = "Guest";
  @type("uint8") color: number = 0;
  @type("string") id: string = "-1";
  @type("boolean") finished: boolean = false;
  @type(TransformSchema) startTransform: TransformSchema =
    new TransformSchema();
}

export class MysteryBoxSchema extends Schema {
  @type("uint8") index: number = 0;
  @type(VectorSchema) position: VectorSchema = new VectorSchema();
  @type("boolean") visible: boolean = true;
}

export class KartRaceState extends Schema {
  @type("uint8") mapId: number = 0;
  @type("number") startTime: number = 0;
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
  @type({ array: MysteryBoxSchema }) mysteries =
    new ArraySchema<MysteryBoxSchema>();
}
