import { Html, Head, Main, NextScript } from "next/document";

const vertexShaderWater = `
      #include <fog_pars_vertex>

      varying vec2 vUv;

      void main() {

      	vUv = uv;

      	#include <begin_vertex>
      	#include <project_vertex>
      	#include <fog_vertex>

      }`;
const fragmentShaderWater = `
      #include <common>
      #include <packing>
      #include <fog_pars_fragment>

      varying vec2 vUv;
      uniform sampler2D tDepth;
      uniform sampler2D tDudv;
      uniform vec3 waterColor;
      uniform vec3 foamColor;
      uniform float cameraNear;
      uniform float cameraFar;
      uniform float time;
      uniform float threshold;
      uniform vec2 resolution;

      float getDepth( const in vec2 screenPosition ) {
      	#if DEPTH_PACKING == 1
      		return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
      	#else
      		return texture2D( tDepth, screenPosition ).x;
      	#endif
      }

      float getViewZ( const in float depth ) {
      	#if ORTHOGRAPHIC_CAMERA == 1
      		return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
      	#else
      		return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
      	#endif
      }

      const float strength = 1.0;

      void main() {

      	vec2 screenUV = gl_FragCoord.xy / resolution;

      	float fragmentLinearEyeDepth = getViewZ( gl_FragCoord.z );
      	float linearEyeDepth = getViewZ( getDepth( screenUV ) );

      	float diff = saturate( fragmentLinearEyeDepth - linearEyeDepth );

      	vec2 displacement = texture2D( tDudv, ( vUv * 2.0 ) - time * 0.05 ).rg;
      	displacement = ( ( displacement * 2.0 ) - 1.0 ) * strength;
      	diff += displacement.x;

      	gl_FragColor.rgb = mix( foamColor, waterColor, step( threshold, diff ) );
      	gl_FragColor.a = 1.0;

      	#include <tonemapping_fragment>
      	#include <encodings_fragment>
      	#include <fog_fragment>

      }
`;

const vertexShaderWaterfall = `

      #include <fog_pars_vertex>

      varying vec2 vUv;

      void main() {

      	vUv = uv;

      	#include <begin_vertex>
      	#include <project_vertex>
      	#include <fog_vertex>

      }`;

const fragmentShaderWaterfall = `
      
      #include <common>
      #include <packing>
      #include <fog_pars_fragment>

      varying vec2 vUv;
      uniform sampler2D tNoise;
      uniform sampler2D tDudv;
      uniform vec3 topDarkColor;
      uniform vec3 bottomDarkColor;
      uniform vec3 topLightColor;
      uniform vec3 bottomLightColor;
      uniform vec3 foamColor;
      uniform float time;

      float round( float a ) {

        return floor( a + 0.5 );

      }

      const float strength = 0.02;
      const float foamThreshold = 0.15;

      void main() {

        vec2 displacement = texture2D( tDudv, vUv + time * 0.1 ).rg;
      	displacement = ( ( displacement * 2.0 ) - 1.0 ) * strength;

        float noise = texture2D( tNoise, vec2( vUv.x, ( vUv.y / 5.0 ) + time * 0.2 ) + displacement ).r;
        noise = round( noise * 5.0 ) / 5.0; // banding, values in the range [0, 0.2, 0.4, 0.6, 0.8, 1]

        vec3 color = mix( mix( bottomDarkColor, topDarkColor, vUv.y ), mix( bottomLightColor, topLightColor, vUv.y ), noise );
        color = mix( color, foamColor, step( vUv.y + displacement.y, foamThreshold ) ); // add foam

      	gl_FragColor.rgb = color;
      	gl_FragColor.a = 1.0;

      	#include <tonemapping_fragment>
      	#include <encodings_fragment>
      	#include <fog_fragment>

      }`;

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body className="antialiased">
                <Main />
                <NextScript />

                <script
                    id="vertexShaderWater"
                    type="x-shader/x-vertex"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: vertexShaderWater }}
                />
                <script
                    id="fragmentShaderWater"
                    type="x-shader/x-fragment"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: fragmentShaderWater }}
                />
                <script
                    id="vertexShaderWaterfall"
                    type="x-shader/x-vertex"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: vertexShaderWaterfall }}
                />
                <script
                    id="fragmentShaderWaterfall"
                    type="x-shader/x-fragment"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                        __html: fragmentShaderWaterfall,
                    }}
                />
            </body>
        </Html>
    );
}
