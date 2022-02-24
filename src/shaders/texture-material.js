import { Program } from 'ogl'

export class TextureMaterial extends Program {
    constructor(gl, options = {}) {
        super(
            gl,
            Object.assign({
                vertex: /* glsl */`
                    precision mediump float;
                    
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
                    precision mediump float;

                    uniform sampler2D tMap;
                    uniform float uAlpha;
                    varying vec2 vUv;

                    void main() {
                        gl_FragColor = texture2D(tMap, vUv);
                        gl_FragColor.a *= uAlpha;
                    }
                `,
                uniforms: {
                    tMap: {
                        value: options.map || null
                    },
                    uAlpha: {
                        value: options.alpha || 1
                    }
                }
            }, options)
        )
    }
    
    set alpha(value) {
        this.uniforms.uAlpha.value = value
    }
    
    set map(value) {
        this.uniforms.tMap.value = value
    }
}
