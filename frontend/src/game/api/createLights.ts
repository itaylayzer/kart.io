import * as THREE from "three";

export type CustomLight = {
    color: THREE.ColorRepresentation;
    intensity: number;
    pos?: THREE.Vector3;
    rot?: THREE.Euler;
    type: "point" | "directional" | "ambient" | "spot";
};

export function createLight(customLights: CustomLight[], scene: THREE.Scene) {
    for (const xlight of customLights) {
        let lightObject;
        if (xlight.type === "directional") {
            lightObject = new THREE.DirectionalLight(
                xlight.color,
                xlight.intensity
            );

            const dirLightHelper = new THREE.DirectionalLightHelper(
                lightObject,
                1
            );
            scene.add(dirLightHelper);
        } else if (xlight.type === "point") {
            lightObject = new THREE.PointLight(xlight.color, xlight.intensity);
        } else if (xlight.type === "spot") {
            lightObject = new THREE.SpotLight(
                xlight.color,
                xlight.intensity,
                100000,
                Math.PI / 4,
                1
            );
            // const spotLightHelper = new THREE.SpotLightHelper(l);
            // scene.add(spotLightHelper);
        } else {
            lightObject = new THREE.AmbientLight(
                xlight.color,
                xlight.intensity
            );
        }

        if (xlight.pos) {
            lightObject.position.copy(xlight.pos);
        } else {
            lightObject.position.set(0, 10, 0);
        }
        if (xlight.rot) {
            lightObject.rotation.copy(xlight.rot);
        }
        if (lightObject.shadow) {
            lightObject.castShadow = true;
            lightObject.receiveShadow = true;
            lightObject.shadow.mapSize.width = 1024;
            lightObject.shadow.mapSize.height = 1024;

            lightObject.shadow.camera.near = 0;
            lightObject.shadow.camera.far = 4000;

            lightObject.shadow.blurSamples = 1;
            lightObject.shadow.autoUpdate = true;
            lightObject.shadow.updateMatrices(lightObject);

            // const d = 50;

            lightObject.shadow.camera.far = 3500;
            lightObject.shadow.bias = -0.0001;
        }

        scene.add(lightObject);
    }
}
