import Emitter from 'tiny-emitter'
import size from 'size'

/**
 * Base class with resizing behaviour
 *
 * @class Component
 * @extends {Emitter}
 */
export class Component extends Emitter {
    constructor() {
        super()
        this.onResize = this.onResize.bind(this)
        size.addListener(this.onResize)
    }

    onResize(width, height) {}
    
    /**
     * Trigger a local resize event
     *
     * @memberof Component
     */
    forceResize() {
        this.onResize(size.width, size.height)
    }

    /**
     * Destroy the resize listener
     *
     * @memberof Component
     */
    destroy() {
        size.removeListener(this.onResize)
    }
}