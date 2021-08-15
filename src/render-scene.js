import { Transform, RenderTarget } from 'ogl'
import size from 'size'

export class RenderScene extends Transform {
    constructor(gl, options = {}) {
        super()
        this.gl = gl
        this.options = options

        this.camera = options.camera// || stage.camera
        this.pixelRatio = options.pixelRatio || 1 //stage.pixelRatio

        if (!options.renderToScreen) {
            const width = options.width || 1
            const height = options.height || 1
            this.rt = new RenderTarget(gl, width * this.pixelRatio, height * this.pixelRatio, Object.assign({
                minFilter: gl.LINEAR,
                magFilter: gl.LINEAR,
                format: gl.RGBA,
                type: gl.UNSIGNED_BYTE,
                depthBuffer: options.depthBuffer === true,
                stencilBuffer: options.stencilBuffer === true,
                depthTexture: options.useDepthTexture === true,
            }, options))
        }

        this.onResize = this.onResize.bind(this)
        size.addListener(this.onResize)
    }

    onResize(width, height) {
        if (!this.rt) return

        this.rt.setSize(width * this.pixelRatio, height * this.pixelRatio)
    }

    setSize(width, height) {
        size.removeListener(this.onResize)
        this.onResize(width, height)
    }

    render(rt) {
        const clearColor = this.options.clearColor || this.clearColor
        const clearAlpha = this.options.clearAlpha || this.clearAlpha || 1
        if (clearColor) {
            this.gl.clearColor(
                clearColor.r,
                clearColor.g,
                clearColor.b,
                clearAlpha,
            )
        }

        this.gl.renderer.render({
            scene: this,
            camera: this.camera,
            target: rt || this.rt,
        })
    }

    get texture() {
        return this.rt.texture
    }

    get depthTexture() {
        return this.rt.depthTexture
    }

    // debug() {
    //     if (!this.rt) return
    //     stage.addDebug(this.rt.texture)
    // }
}