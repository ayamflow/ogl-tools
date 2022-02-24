import { Program, Color } from 'ogl'

export class ColorMaterial extends Program {
    constructor(gl, options) {
        super(
            gl,
            Object.assign(
                {
                    vertex: /* glsl */`
                attribute vec3 position;
                attribute vec2 uv;
                varying vec2 vUv;

                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
                    fragment: /* glsl */`
                precision highp float;

                uniform vec3 uColor;
                uniform float uAlpha;
                varying vec2 vUv;

                void main() {
                    gl_FragColor = vec4(uColor, uAlpha);
                }
            `,
                    uniforms: {
                        uColor: {
                            value: options.color instanceof Color ? options.color : new Color(options.color)
                        },
                        uAlpha: {
                            value: options.opacity == undefined ? 1 : options.opacity
                        }
                    }
                },
                options
            )
        )
    }
}
