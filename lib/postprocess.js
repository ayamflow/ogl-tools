import stage from './stage'
import Shader from './shader'
import Uniforms from './uniforms'
const THREE = {} // DEBUG

export default class Postprocess {
    constructor(options = {}) {
        this.scene = new THREE.Scene()
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2)
        this.camera.position.z = 1

        let geometry = new THREE.BufferGeometry()
        let vertices = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0])
        geometry.addAttribute(
            'position',
            new THREE.BufferAttribute(vertices, 2)
        )

        this.quad = new THREE.Mesh(
            geometry,
            new Shader(
                Object.assign(
                    {
                        name: 'Postprocess',
                        vertexShader: `
                    void main() {
                        gl_Position = vec4(position.xy, 0.0, 1.0);
                    }
                `,
                    },
                    options
                )
            )
        )
        this.quad.frustumCulled = false
        this.scene.add(this.quad)
    }

    render() {
        stage.beforeRender()

        stage.renderer.render(this.scene, this.camera)

        stage.renderOrtho()
        stage.afterRender()
    }
}
