import size from 'size'
import { mouse } from './mouse'
import { uniforms } from './uniforms'
import { Interaction } from './interaction'
import { Component } from './component'
import { TextureMaterial } from './shaders/texture-material'
import { Renderer, Camera, Transform, Mesh, Color, Raycast, Plane, Orbit } from 'ogl'
import { ticker } from './ticker'
import { RenderScene } from './render-scene'

class Stage extends Component {
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
        })
        this.resizeTarget = options.resizeTarget || null
        this.pixelRatio = options.pixelRatio || window.devicePixelRatio || 1

        this.renderer = new Renderer(
            Object.assign(
                {
                    canvas: this.el,
                    antialias: options.antialias,
                    alpha: options.alpha || false,
                    dpr: this.pixelRatio,
                    powerPreference: options.powerPreference || 'high-performance',
                    preserveDrawingBuffer: options.preserveDrawingBuffer || false,
                },
                options
            )
        )

        const gl = this.renderer.gl
        this.gl = gl

        // Ortho scene for 2D/UI
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

        this.camera = new Camera(gl, {
            fov: 45,
            aspect: size.width / size.height,
            near: 1,
            far: 1000,
        })
        this.camera.position.z = 5
        this.scene = new RenderScene(this.gl, { renderToScreen: true })

        this.clearColor = new Color(options.clearColor || '#000000')

        // init interaction

        mouse.setCamera(this.camera)
        mouse.bind()

        this.controls = new Orbit(this.camera, { enabled: false })
        this.raycaster = new Raycast(gl)

        this.time = Date.now()
        this.onUpdate = this.onUpdate.bind(this)
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
        ticker.add(this.onUpdate)        
    }

    stop() {
        ticker.remove(this.onUpdate)
    }

    onUpdate() {
        let time = Date.now()
        const dt = time - this.time

        this.emit('tick', dt)
        this.render()
        this.time = time

        uniforms.update(dt)
    }

    toggleControls(state) {
        this.orbit.enabled = state
    }

    render() {
        if (this.controls.enabled) this.controls.update()
        
        this.renderer.render({scene: this.scene, camera: this.camera})
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
        if (!this.renderer) return

        let resolution = size
        if (this.resizeTarget) {
            let box = this.resizeTarget.getBoundingClientRect()
            resolution = {
                width: box.width,
                height: box.height
            }
        }
        this.renderer.setSize(resolution.width, resolution.height)

        this.orthoCamera.orthographic({
            top: resolution.height * 0.5,
            bottom: -resolution.height * 0.5,
            left: -resolution.width * 0.5,
            right: resolution.width * 0.5,
        })

        this.camera.aspect = resolution.width / resolution.height
        this.camera.perspective()

        uniforms.resize(resolution.width, resolution.height, this.pixelRatio)

        if (this.debugs) {
            this.debugs.forEach(function(mesh, i) {
                mesh.position.x = -resolution.width * 0.5 + 50 + 100 * i
                mesh.position.y = -resolution.height * 0.5 + 50
            }, this)
        }

        setTimeout(() => {
            this.emit('resize')
        })
    }

    raycast(camera, objects) {
        this.raycaster.castMouse(camera, mouse.screenPosition)
        return this.raycaster.intersectBounds(objects)
    }

    interact(options) {
        this.interaction = this.interaction || new Interaction()
        this.interaction.add(options)
    }

    getDebugMesh(side = 10) {
        // return new Mesh(
        //     new BoxGeometry(side, side, side),
        //     new MeshNormalMaterial()
        // )
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

    destroy() {
        // TODO: renderer, scene
        this.stop()
        size.removeListener(this.onResize)
    }
}

export const stage = new Stage()
