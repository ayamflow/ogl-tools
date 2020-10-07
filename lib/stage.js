import size from 'size'
import Mouse from './mouse'
import Uniforms from './uniforms'
import Interaction from './interaction'
import Screen from './screen'
import TextureMaterial from './texture-material'
import {Renderer, Camera, Transform, Mesh, Color, Raycast, Plane, Orbit} from 'ogl'
import Ticker from './ticker'

class Stage extends Transform {
    constructor() {
        super()
    }

    init(options = {}) {
        this.el = options.canvas || document.createElement('canvas')
        Object.assign(this.el.style, {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            'pointer-events': 'none',
        })
        this.resizeTarget = options.resizeTarget || null

        this.pixelRatio = Math.min(
            options.pixelRatio || window.devicePixelRatio || 1,
            2
        )
        // this.pixelRatio = Math.max(this.pixelRatio, 1.25)
        this.renderer = new Renderer(
            Object.assign(
                {
                    canvas: this.el,
                    antialias: false,
                    alpha: true,
                    dpr: this.pixelRatio,
                    powerPreference: 'high-performance'
                },
                options
            )
        )
        this.renderer.setSize(size.width, size.height)

        const gl = this.renderer.gl
        this.gl = gl

        this.camera = new Camera(gl, {
            fov: 45,
            aspect: size.width / size.height,
            near: 1,
            far: 1000,
        })
        this.camera.position.z = 5

        this.orthoScene = new Transform()
        this.orthoCamera = new Camera(gl, {
            left: -0.5,
            right: 0.5,
            top: 0.5,
            bottom: -0.5,
            near: 1,
            far: 2,
        })
        this.orthoCamera.position.z = 1

        this.clearColor = new Color(options.clearColor || '#000000')

        Mouse.setCamera(this.camera)
        Mouse.bind()
        Uniforms.init()

        // this.controls = new Orbit(this.camera)
        
        this.raycaster = new Raycast(gl)

        this.render = this.render.bind(this)
        this.onResize = this.onResize.bind(this)
        size.addListener(this.onResize)
        this.onResize()

        // DEBUG
        window.stage = this
    }

    setDPR(dpr) {
        this.pixelRatio = dpr
        this.renderer.dpr = dpr
    }

    start() {
        Ticker.add(this.render)        
    }

    stop() {
        Ticker.remove(this.render)
    }

    render() {
        // this.controls.update()

        this.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, 1)
        // this.camera.lookAt([0, 0, 0])
        this.renderer.render({scene: this, camera: this.camera})

        this.renderOrtho()
    }

    renderOrtho() {
        let clear = this.renderer.autoClear
        this.renderer.autoClear = false
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT)
        this.renderer.render({scene: this.orthoScene, camera: this.orthoCamera})
        this.renderer.autoClear = clear
    }

    onResize() {
        let resolution = size
        if (this.resizeTarget) {
            let box = this.resizeTarget.getBoundingClientRect()
            resolution = {
                width: box.width,
                height: box.height
            }
        }
        this.renderer.setSize(resolution.width, resolution.height)

        this.camera.aspect = resolution.width / resolution.height
        this.camera.perspective()

        this.orthoCamera.orthographic({
            top: resolution.height * 0.5,
            bottom: -resolution.height * 0.5,
            left: -resolution.width * 0.5,
            right: resolution.width * 0.5,
            near: -100,
            far: 100
        })

        if (this.debugs) {
            this.debugs.forEach(function(mesh, i) {
                mesh.position.x = -resolution.width * 0.5 + 50 + 100 * i
                mesh.position.y = -resolution.height * 0.5 + 50
            }, this)
        }
    }

    raycast(camera, objects) {
        this.raycaster.castMouse(camera, Mouse.screenPosition)
        return this.raycaster.intersectBounds(objects)
    }

    interact(options) {
        this.interaction = this.interaction || new Interaction()
        this.interaction.add(options)
    }

    addDebug(texture) {
        const side = 120
        const gl = this.gl
        this.debugs = this.debugs || []

        let mesh = new Mesh(gl, {
            geometry: new Plane(gl, {
                width: side,
                height: side,
            }),
            program: new TextureMaterial(gl, {map: texture}),
        })
        mesh.position.x = -size.width * 0.5 + side * 0.5 + side * this.debugs.length
        mesh.position.y = -size.height * 0.5 + side * 0.5
        this.debugs.push(mesh)
        this.orthoScene.addChild(mesh)
    }
}

export default new Stage()
