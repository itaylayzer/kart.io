import { IKeyboardController } from "../controller/IKeyboardController";
import { Player } from "./Player";
import { Vector3Interpolation, QuaternionInterpolation } from "../utils/interpolation";
import { Vector3, Quaternion } from "three";

export class OnlinePlayer extends Player {
    public positionInterpolation: Vector3Interpolation;
    public quaternionInterpolation: QuaternionInterpolation;
    public velocityInterpolation: Vector3Interpolation;

    constructor(id: number, name: string, color: number) {
        super(id, false, name, color, new IKeyboardController());
        
        // Initialize interpolation buffers for smooth network updates
        this.positionInterpolation = new Vector3Interpolation();
        this.quaternionInterpolation = new QuaternionInterpolation();
        this.velocityInterpolation = new Vector3Interpolation();
    }
}
