class Ticker {
    constructor() {
        this.rafId = -1
        this.elapsed = 0
        this.renders = []
        this.update = this.update.bind(this)
    }

    start() {
        this.elapsed = performance.now()
        this.rafId = requestAnimationFrame(this.update)
    }

    stop() {
        cancelAnimationFrame(this.rafId)
    }

    update(now) {
        this.rafId = requestAnimationFrame(this.update)
        const dt = now - this.elapsed
        this.elapsed = now

        for (let i = 0; i < this.renders.length; i++) {
            this.renders[i](dt)
        }
    }

    add(cb) {
        if (this.renders.indexOf(cb) > -1) return
        if (!this.renders.length) this.start()
        this.renders.push(cb)
    }

    remove(cb) {
        let index = this.renders.indexOf(cb)
        if (index < 0) return
        this.renders.splice(index, 1)
        if (!this.renders.length) this.stop()
    }
}

export default new Ticker()
