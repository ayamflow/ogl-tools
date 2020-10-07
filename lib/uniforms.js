import size from 'size'
import stage from './stage'
import Mouse from './mouse'
import {Vec3} from 'ogl'
import Ticker from './ticker'

class Uniforms {
    constructor() {
        this.uniforms = {}

        this.add('time', {
            value: 0,
            useGUI: false,
        })
        this.add('deltaTime', {
            value: 0,
            useGUI: false,
        })
        this.add('mouse2d', {
            value: Mouse.screenPosition,
            useGUI: false,
        })
        this.add('mouse3d', {
            value: Mouse.worldPosition,
            useGUI: false,
        })
        this.add('resolution', {
            value: new Vec3(size.width, size.height, size.width / size.height),
            useGUI: false,
        })
        this.add('pixelRatio', {
            value: 1
        })
    }

    init() {
        Ticker.add(::this.update)
        size.addListener(::this.resize)
        this.resize()
    }

    resize() {
        this.uniforms.resolution.value.set(
            size.width,
            size.height,
            size.width / size.height
        )
        this.uniforms.pixelRatio.value = stage.pixelRatio
    }

    add(name, object) {
        const uniforms = this.uniforms
        if (uniforms[name]) return

        uniforms[name] = object

        Object.defineProperty(this, name, {
            set: function(value) {
                uniforms[name] = value
            },
            get: function() {
                return uniforms[name]
            },
        })
    }

    extend(uniforms) {
        // copy references
        for (let key in this.uniforms) {
            uniforms[key] = this.uniforms[key]
        }
        return uniforms
    }

    merge(...params) {
        let result = {}
        params.forEach(function(uniforms) {
            for (let key in uniforms) {
                result[key] = uniforms[key]
            }
        })

        return result
    }

    update(dt) {
        this.uniforms.deltaTime.value = dt / 1000
        this.uniforms.time.value += this.uniforms.deltaTime.value
    }
}

export default new Uniforms()
