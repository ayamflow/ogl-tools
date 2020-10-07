import size from 'size'
import sniffer from 'sniffer'
import Stats from 'stats.js'
import rightNow from 'right-now'
import Mouse from './mouse'
import Uniforms from './uniforms'
import Emitter from 'tiny-emitter'
import {
    Renderer,
    Camera,
    Transform,
    Program,
    Mesh,
    Cube,
    Plane,
    Raycast,
} from 'ogl'
import DebugMaterial from 'components/gl-tools/debug-material'
import TextureMaterial from 'components/gl-tools/texture-material'

const DEBUG = process.env.ENV == 'dev'

class Stage extends Emitter {
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
        })

        this.renderer = new Renderer(
            Object.assign(
                {
                    canvas: this.el,
                    antialias: false,
                    alpha: true,
                    // preserveDrawingBuffer: true
                },
                options
            )
        )
        const gl = this.renderer.gl
        this.gl = gl

        this.pixelRatio = Math.min(
            options.pixelRatio || window.devicePixelRatio || 1,
            2
        )
        this.renderer.dpr = this.pixelRatio

        this.scene = new Transform()
        this.camera = new Camera(gl, {
            fov: 45,
            aspect: 1,
            near: 1,
            far: 1000,
        })
        this.camera.position.z = 300

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

        Mouse.setCamera(this.camera)
        Mouse.bind()
        this.raycaster = new Raycast(gl)

        // DEBUG
        if (DEBUG) {
            window.stage = this
            let controls = new Orbit(this.camera)
            this.stats = new Stats()
            document.body.appendChild(this.stats.domElement)
            window.addControls = () => {
                let controls = new Orbit(this.camera)
            }
        }

        this.onResize = this.onResize.bind(this)
        this.onUpdate = this.onUpdate.bind(this)

        // Resize
        size.addListener(this.onResize)
        this.onResize(size.width, size.height)
        Uniforms.init()

        // rAF after resize
        this.rafId = -1
        this.time = rightNow()
        this.once('resize', () => {
            this.rafId = requestAnimationFrame(this.onUpdate)
        })
    }

    toggleShadows(enabled, type) {
        // this.renderer.shadowMap.enabled = enabled
        // this.renderer.shadowMap.type = type || THREE.PCFSoftShadowMap
    }

    togglePostprocessing(enabled) {
        this.hasPostprocessing = enabled
    }

    raycast(camera, objects) {
        this.raycaster.castMouse(camera, Mouse.screenPosition)
        return this.raycaster.intersectBounds(
            objects instanceof Array ? objects : [objects]
        )
    }

    onResize(width, height) {
        this.renderer.setSize(width, height)

        this.camera.aspect = width / height
        this.camera.perspective()

        this.orthoCamera.top = height * 0.5
        this.orthoCamera.bottom = -height * 0.5
        this.orthoCamera.left = -width * 0.5
        this.orthoCamera.right = width * 0.5
        this.orthoCamera.orthographic()

        if (this.debugs) {
            this.debugs.forEach(function(mesh, i) {
                mesh.position.x = -width * 0.5 + 50 + 100 * i
                mesh.position.y = -height * 0.5 + 50
            }, this)
        }

        setTimeout(() => {
            this.emit('resize')
        })
    }

    beforeRender() {
        if (this.stats) {
            this.stats.begin()
        }
    }

    onUpdate() {
        this.rafId = requestAnimationFrame(this.onUpdate)
        let time = rightNow()
        const dt = time - this.time

        this.emit('tick', dt)

        if (!this.hasPostprocessing) {
            this.beforeRender()
            this.renderer.render({scene: this.scene, camera: this.camera})
            this.renderOrtho()
            this.afterRender()
        }

        this.time = time
    }

    renderOrtho() {
        // this.renderer.autoClear = false
        // this.gl.clearDepth()
        this.renderer.render({scene: this.orthoScene, camera: this.orthoCamera})
        // this.renderer.autoClear = true
    }

    afterRender() {
        if (this.stats) {
            this.stats.end()
        }
    }

    getDebugMesh(side = 10) {
        return new Mesh(gl, {
            geometry: new Cube(gl, {
                width: side,
                height: side,
                depth: side,
            }),
            material: new DebugMaterial(gl),
        })
    }

    addDebug(texture) {
        const side = 120
        this.debugs = this.debugs || []

        let mesh = new Mesh(gl, {
            geometry: new Plane(gl, {
                width: side,
                height: side,
            }),
            material: new TextureMaterial(gl, {map: texture}),
        })
        mesh.position.x =
            -size.width * 0.5 + side * 0.5 + side * this.debugs.length
        mesh.position.y = -size.height * 0.5 + side * 0.5
        this.debugs.push(mesh)
        this.orthoScene.add(mesh)
    }

    destroy() {
        cancelRequestAnimation(this.rafId)
        size.removeListener(this.onResize)
    }
}

export default new Stage()
