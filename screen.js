import {Geometry, Mesh, Program} from 'ogl'

export default class Screen extends Mesh {
    constructor(gl, options = {}) {
        const geometry = new Geometry(gl, {
            position: {
                size: 3,
                data: new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
            },
            uv: {
                size: 2,
                data: new Float32Array([0, 0, 2, 0, 0, 2]),
            },
        })
        const program = new Program(gl, Object.assign({
            vertex: options.vertex || `
                attribute vec2 uv;
                attribute vec3 position;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragment: options.fragment,
            uniforms: options.uniforms,
            depthTest: false,
            depthWrite: false,
        }, options))

        super(gl, {geometry, program})
        this.renderOrder = -Infinity
    }
}
