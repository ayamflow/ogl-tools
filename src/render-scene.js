import { Transform, RenderTarget } from 'ogl'
import size from 'size'

export class RenderScene extends Transform {
    constructor(gl, options = {}) {
        super()
        this.gl = gl
        this.options = options

        if (!options.renderToScreen) {
            this.initRT()
        }

        this.camera = options.camera// || stage.camera
        this.pixelRatio = options.pixelRatio //stage.pixelRatio

        // this.onResize = this.onResize.bind(this)
        // size.addListener(this.onResize)
    }

    onResize(width, height) {
        this.initRT(width, height)
    }

    setSize(width, height) {
        size.removeListener(this.onResize)
        this.onResize(width, height)
    }

    initRT(width, height) {
        this.rt = createRT(this.gl, width * this.pixelRatio, height * this.pixelRatio, this.options)
    }

    render(rt) {
        if (this.options.clearColor) {
            this.gl.clearColor(
                this.options.clearColor.r,
                this.options.clearColor.g,
                this.options.clearColor.b,
                this.options.clearAlpha || 1,
            )
        }

        this.gl.renderer.render({
            scene: this.scene,
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

function createRT(gl, width, height, options = {}) {
    return new RenderTarget(width, height, Object.assign({
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
        format: gl.RGBA,
        type: gl.UNSIGNED_BYTE,
        depthBuffer: options.depthBuffer === true,
        stencilBuffer: options.stencilBuffer === true,
        depthTexture: options.useDepthTexture === true,
    }, options))
}