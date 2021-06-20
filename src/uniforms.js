import { mouse } from './mouse'
import { Vec3 } from 'ogl'

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
            value: mouse.screenPosition,
            useGUI: false,
        })
        this.add('mouse3d', {
            value: mouse.worldPosition,
            useGUI: false,
        })
        this.add('resolution', {
            value: new Vec3(0, 0, 1),
            useGUI: false,
        })
        this.add('pixelRatio', {
            value: 1
        })
    }

    resize(width, height, dpr) {
        this.uniforms.resolution.value.set(
            width,
            height,
            width / height
        )
        this.uniforms.pixelRatio.value = dpr
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

export const uniforms = new Uniforms()
export default uniforms