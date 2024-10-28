import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { PlayerKeyboard } from './PlayerKeyboard';
import { Easing, Tween } from "@tweenjs/tween.js";
import { GameState } from '../game/GameState';
import { damp } from 'three/src/math/MathUtils.js';

export class PlayerModel extends THREE.Group {

    public update: () => void;

    public shake: (duration: number) => void;
    constructor(
        body: CANNON.Body,
        keyboard: PlayerKeyboard,
        game: GameState,

    ) {
        const model = new THREE.Object3D();

        super();
        super.add(model);

        let tween: null | Tween
        let driftSide = [0, 0];
        let startTime: number;

        this.shake = (Duration) => {
            tween = new Tween({ x: 0 })
                .to({ x: Math.PI * 2 })
                .duration(Duration)
                .easing(Easing.Quintic.Out)
                .onUpdate(({ x }) => {
                    model.rotation.y = x;
                })
                .onComplete(() => {
                    model.rotation.y = 0;
                });
            tween.start(0);
            startTime = game.elapsedTime;
        };

        this.update = () => {
            this.position.copy(body.position);
            this.quaternion.copy(body.quaternion);

            model.rotation.set(0, 0, 0);

            // if (rocket.visible && randInt(0, 1)) {
            // new Dust(rockBack.getWorldPosition(new THREE.Vector3()));
            // }
            if (keyboard.isKeyDown(32) || keyboard.isKeyDown(-6)) {
                driftSide[0] = keyboard.horizontalRaw * 0.6;
            }
            if (keyboard.isKeyUp(32) || keyboard.isKeyUp(-6)) {
                driftSide[0] = 0;
            }
            tween?.update((game.elapsedTime - startTime) * 1000);
            driftSide[1] = damp(
                driftSide[1],
                driftSide[0],
                1.5,
                game.deltaTime * 7
            );
            model.rotateOnAxis(new THREE.Vector3(0, 1, 0), driftSide[1]);

            this.rotation.set(0, 0, 0);

            const forwardVec = body.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
            const velocityMagnitude = forwardVec.dot(body.velocity.clone());


            this.position.copy(body.position);
            this.quaternion.copy(body.quaternion);

        };
    }
}





