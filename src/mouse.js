import size from 'size'
import touches from 'touches'
import { ticker } from './ticker'
import {Vec2, Vec3} from 'ogl'
var touch
var v2 = new Vec2()

class Mouse {
    constructor() {
        this.position = new Vec2(0, 0)
        this.screenPosition = new Vec3(2, 2, 0)
        this.screenDirection = new Vec2()
        this.screenVelocity = new Vec2()

        this.worldPosition = new Vec3()
        this.worldDirection = new Vec3()
        // this.worldVelocity = new Vec3()

        this.isDown = false
        this.onStart = this.onStart.bind(this)
        this.onMove = this.onMove.bind(this)
        this.onEnd = this.onEnd.bind(this)
        this.onUpdate = this.onUpdate.bind(this)

        this.time = 0;
    }

    setCamera(camera) {
        this.camera = camera
    }

    bind() {
        if (!touch && typeof window !== 'undefined') {
            touch = touches(window, {filtered: true, preventSimulated: false})
        }

        touch.on('start', this.onStart)
        touch.on('move', this.onMove)
        touch.on('end', this.onEnd)
        ticker.add(this.onUpdate)

        this.time = performance.now();
    }
    
    unbind() {
        touch.off('start', this.onStart)
        touch.off('move', this.onMove)
        touch.off('end', this.onEnd)
        ticker.remove(this.onUpdate)
    }

    onStart(event, pos) {
        this.isDown = true
    }

    onMove(event, pos) {
        // event.preventDefault()

        this.position.x = pos[0]
        this.position.y = pos[1]
    }

    onEnd(event, pos) {
        this.onMove(event, pos)
        this.isDown = false
    }

    onUpdate() {
        v2.copy(this.screenPosition)
        
        this.screenPosition.x = (this.position.x / size.width) * 2 - 1
        this.screenPosition.y = -(this.position.y / size.height) * 2 + 1

        this.worldPosition.set(
            this.screenPosition.x,
            this.screenPosition.y,
            0.5
        )
        this.camera.unproject(this.worldPosition)
        let direction = this.worldPosition.sub(this.camera.position).normalize()
        let distance = -this.camera.position.z / direction.z
        this.worldPosition.copy(
            this.camera.position.clone().add(direction.multiply(distance))
        )

        const now = performance.now()
        const time = now - this.time
        this.screenVelocity.copy(this.screenPosition).sub(v2).divide(time).multiply(1000)
        this.time = now
    }
}

export const mouse = new Mouse()
