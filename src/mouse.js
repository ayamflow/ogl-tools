import size from 'size'
import touches from 'touches'
// import Velocity from 'lib/velocity-tracker'
import Ticker from './ticker'
import {Vec2, Vec3} from 'ogl'
const touch = touches(window, {filtered: true, preventSimulated: false})
// const velocity = new Velocity()

class Mouse {
    constructor(options) {
        this.position = new Vec2(0, 0)
        this.screenPosition = new Vec3(2, 2, 0)
        this.screenDirection = new Vec2()
        // this.screenVelocity = new Vec2()

        this.worldPosition = new Vec3()
        this.worldDirection = new Vec3()
        // this.worldVelocity = new Vec3()

        this.isDown = false
        this.onStart = this.onStart.bind(this)
        this.onMove = this.onMove.bind(this)
        this.onEnd = this.onEnd.bind(this)
        this.onUpdate = this.onUpdate.bind(this)
    }

    setCamera(camera) {
        this.camera = camera
    }

    bind() {
        touch.on('start', this.onStart)
        touch.on('move', this.onMove)
        touch.on('end', this.onEnd)
        Ticker.add(this.onUpdate)
        // velocity.start()
    }
    
    unbind() {
        touch.off('start', this.onStart)
        touch.off('move', this.onMove)
        touch.off('end', this.onEnd)
        Ticker.remove(this.onUpdate)
        // velocity.stop()
    }

    onStart(event, pos) {
        this.isDown = true
    }

    onMove(event, pos) {
        // event.preventDefault()
        // velocity.setPoint(pos[0], pos[1])

        this.position.x = pos[0]
        this.position.y = pos[1]
        this.screenPosition.x = (pos[0] / size.width) * 2 - 1
        this.screenPosition.y = -(pos[1] / size.height) * 2 + 1

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
    }

    onEnd(event, pos) {
        this.onMove(event, pos)
        this.isDown = false
    }

    onUpdate() {
        // this.screenPosition.z = velocity.value / 100
    }

    // get velocity() {
    //     return this.screenPosition.z
    // }
}

export default new Mouse()
