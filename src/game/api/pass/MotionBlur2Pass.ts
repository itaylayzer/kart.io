import * as THREE from "three";
import {
    Pass,
    FullScreenQuad,
} from "three/examples/jsm/postprocessing/Pass.js";

export class MotionBlur2Pass extends Pass {
    private motionBlurShader: any;
    public uniforms: any;
    private material: THREE.ShaderMaterial;
    private fsQuad: FullScreenQuad;

    constructor() {
        super();

        // Define the motion blur shader
        this.motionBlurShader = {
            uniforms: {
                tDiffuse: { value: null },
                iResolution: {
                    value: new THREE.Vector2(
                        window.innerWidth,
                        window.innerHeight
                    ),
                },
                iTime: { value: 0.0 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                #define PI 3.14159265359

                uniform sampler2D tDiffuse;
                uniform vec2 iResolution;
                uniform float iTime;
                varying vec2 vUv;

                // Hash function for randomness
                float hash13(vec3 p3) {
                    p3 = fract(p3 * .1031);
                    p3 += dot(p3, p3.yzx + 19.19);
                    return fract((p3.x + p3.y) * p3.z);
                }

                void main() {
                    vec3 result = vec3(0);
                    float totalWeight = 0.0; // Initialize total weight
                    bool motionBlur = true; // Change this for toggling motion blur

                    if (motionBlur) {
                        #define BLUR 30
                        for (int i = 0; i < BLUR; i++) {
                            // Randomly offset UVs for motion blur
                            float rnd = hash13(vec3(vUv, iTime * 100.0 + float(i)));
                            vec2 uvOffset = vec2(rnd * 0.01); // Adjust this for more or less blur
                            vec2 uv = vUv + uvOffset; // Offset the UVs by a small amount
                            
                            // Sample the texture and accumulate color
                            vec3 sampleColor = texture2D(tDiffuse, uv).rgb;
                            result += sampleColor; // Add to result
                            totalWeight += 1.0; // Increment total weight
                        }
                        result /= totalWeight; // Normalize the accumulated color
                    } else {
                        result = texture2D(tDiffuse, vUv).rgb;
                    }

                    gl_FragColor = vec4(result, 1.0); // Output the final color
                }
            `,
        };

        this.uniforms = THREE.UniformsUtils.clone(
            this.motionBlurShader.uniforms
        );
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.motionBlurShader.vertexShader,
            fragmentShader: this.motionBlurShader.fragmentShader,
        });

        this.fsQuad = new FullScreenQuad(this.material);
    }

    render(
        renderer: THREE.WebGLRenderer,
        writeBuffer: THREE.WebGLRenderTarget,
        readBuffer: THREE.WebGLRenderTarget,
        deltaTime: number
    ) {
        this.uniforms["tDiffuse"].value = readBuffer.texture;
        this.uniforms["iTime"].value += deltaTime;
        this.uniforms["iResolution"].value.set(
            window.innerWidth,
            window.innerHeight
        );

        // Set the render target to write buffer or screen
        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
        } else {
            renderer.setRenderTarget(writeBuffer);
            renderer.clear();
        }

        // Render the fullscreen quad with the effect
        this.fsQuad.render(renderer);
    }
}
