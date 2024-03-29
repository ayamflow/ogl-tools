import { Program } from 'ogl'

export class DebugMaterial extends Program {
    constructor(gl, options) {
        super(
            gl,
            Object.assign({
                vertex: /* glsl */`
                    precision mediump float;

                    attribute vec3 position;
                    attribute vec3 normal;
                    varying vec3 vNormal;

                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;

                    void main() {
                        vNormal = normal;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragment: /* glsl */`
                    precision mediump float;
                    
                    varying vec3 vNormal;

                    void main() {
                        gl_FragColor = vec4(vec3(vNormal * 0.5 + 0.5), 1.0);
                    }
                `,
                }, options)
        )
    }
}
