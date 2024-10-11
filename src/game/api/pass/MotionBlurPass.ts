import * as THREE from "three";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";

export class MotionBlurPass extends Pass {
    private motionBlurShader: any;
    public uniforms: any;
    private material: THREE.ShaderMaterial;
    private fsQuad: FullScreenQuad;

    constructor() {
        super();

        // Define the motion blur shader
        this.motionBlurShader = {
            uniforms: {
                tDiffuse: { value: null }, // No need for an initial value here
                uTime: { value: 0.0 },
                uVelocity: { value: new THREE.Vector2(2, 2) },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uVelocity;
    varying vec2 vUv;

    void main() {
        // Original color
        vec4 color = texture2D(tDiffuse, vUv);

        // Apply motion blur using velocity
        vec2 blurDirection = uVelocity * 0.05;
        vec4 blurColor = vec4(0.0);

        // Sample neighboring pixels for the blur effect
        blurColor += texture2D(tDiffuse, vUv + blurDirection * -0.05);
        blurColor += texture2D(tDiffuse, vUv + blurDirection * -0.03);
        blurColor += texture2D(tDiffuse, vUv + blurDirection * -0.01);

        // Average the colors with a different weighting
        vec4 averageBlurColor = blurColor / 3.0;

        // Blend the original color with the average blur color
        // Increase the weight of the original color to prevent darkness
        gl_FragColor = mix(color * 1.2, averageBlurColor, 0.5); // Increase the original color's weight
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
        // Set the texture to the shader
        this.uniforms["tDiffuse"].value = readBuffer.texture;

        // Update any dynamic uniforms
        this.uniforms["uTime"].value += deltaTime;

        this.material.uniforms = this.uniforms;

        // Ensure that the render target is set to the correct buffer
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
