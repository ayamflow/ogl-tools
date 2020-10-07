import stage from './stage'

export default class RenderPass {
    constructor(options = {}) {
        this.rt = new THREE.WebGLRenderTarget(1, 1, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            depthBuffer: options.depthBuffer,
            stencilBuffer: options.stencilBuffer,
            generateMipmaps: false,
        })

        if (options.useDepthTexture === true) {
            this.rt.depthTexture = new THREE.DepthTexture()
        }

        this.scene = options.scene || new THREE.Scene()
        this.camera = options.camera || stage.camera
    }

    setSize(width, height) {
        this.rt.setSize(width, height)
    }

    render(rt) {
        stage.renderer.render(this.scene, this.camera, rt || this.rt, false)
    }

    get texture() {
        return this.rt.texture
    }

    get depthTexture() {
        return this.rt.depthTexture
    }

    set overrideMaterial(value) {
        this.scene.overrideMaterial = value
    }
}
