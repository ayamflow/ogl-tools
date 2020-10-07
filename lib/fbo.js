import Shader from './shader'
import stage from './stage'
import Uniforms from './uniforms'
import sniffer from 'sniffer'
import size from 'size'

const THREE = {} // DEBUG

export default class FBO {
    constructor(options = {}) {
        const format = options.format || THREE.RGBAFormat
        const type = FBO.getType(stage.renderer)

        this.rt1 = createRenderTarget(options.size, type, format)
        this.rt2 = this.rt1.clone()

        this.scene = new THREE.Scene()
        this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 2)
        this.camera.position.z = 1

        let defaultPositionTexture =
            options.defaultPositionTexture ||
            FBO.getRandomDataTexture(options.size, format, type)

        this.quad = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1, 1),
            new Shader({
                name: 'FBO',
                uniforms: Uniforms.merge({}, options.uniforms || {}, {
                    positionTexture: {
                        value: defaultPositionTexture,
                    },
                    prevPositionTexture: {
                        value: null,
                    },
                }),
                fragmentShader: prependUniforms(options.simulationShader),
            })
        )
        this.scene.add(this.quad)

        this.ping = false

        if (options.debug) stage.addDebug(this.rt1.texture)
    }

    get texture() {
        return this.ping ? this.rt1.texture : this.rt2.texture
    }

    get uniforms() {
        return this.quad.material.uniforms
    }

    render() {
        stage.renderer.render(
            this.scene,
            this.camera,
            this.ping ? this.rt1 : this.rt2
        )

        this.quad.material.uniforms.prevPositionTexture.value = this.ping
            ? this.rt1.texture
            : this.rt2.texture

        this.ping = !this.ping
    }
}

function createRenderTarget(size, type, format) {
    return new THREE.WebGLRenderTarget(size, size, {
        type,
        format,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false,
        generateMipmaps: false,
    })
}

function prependUniforms(shader) {
    return (
        `
        uniform sampler2D positionTexture;
        uniform sampler2D prevPositionTexture;
    ` + shader
    )
}

Object.assign(FBO, {
    getRandomDataTexture: function(size, format, type) {
        let dataArray = new Float32Array(size * size * 4)
        for (let i = 0; i < size * size; i++) {
            dataArray[i * 4 + 0] = Math.random() * 2 - 1
            dataArray[i * 4 + 1] = Math.random() * 2 - 1
            dataArray[i * 4 + 2] = Math.random() * 2 - 1
            dataArray[i * 4 + 3] = 0
        }

        let dataTexture = new THREE.DataTexture(
            dataArray,
            size,
            size,
            format || THREE.RGBAFormat,
            type || THREE.FloatType
        )
        dataTexture.minFilter = THREE.NearestFilter
        dataTexture.magFilter = THREE.NearestFilter
        dataTexture.needsUpdate = true

        return dataTexture
    },

    getType: function(renderer) {
        const gl = renderer.context
        let type = THREE.FloatType
        let ext = gl.getExtension('OES_texture_half_float')
        gl.getExtension('OES_texture_half_float_linear')
        if (sniffer.isIos && ext) {
            type = THREE.HalfFloatType
        }

        return type
    },
})
