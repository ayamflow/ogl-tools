import {Color} from 'ogl'
import sniffer from 'sniffer'
import Mouse from './mouse'
import stage from './stage'
import size from 'size'

const pixel = new Uint8Array(1 * 1 * 4)
var cursor = ''

class GpuPicking {
    constructor() {
        this.ids = []
        this.count = 0
    }

    createId() {
        let r = ++this.count
        return rgbToHex(r, 0, 255)
    }

    add({onHover, onOut, onClick}) {
        let id = this.createId()
        this.ids.push({id, onHover, onOut, onClick, isHover: false})

        return id
    }

    remove(id) {
        // TODO?
    }

    click(rt) {
        this.update(rt, true)
    }
    
    update(rt, click = false) {
        const gl = stage.gl
        const dpr = stage.pixelRatio

        gl.bindFramebuffer(gl.FRAMEBUFFER, rt.buffer)
        gl.readPixels(Mouse.position.x * dpr, (size.height - Mouse.position.y) * dpr, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        let hit = this.ids.filter(data => data.id == rgbToHex(pixel[0], pixel[1], pixel[2]))[0]
        
        // console.log(`%c pixel`, `color: white; background: rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]});`, pixel, hit)

        if (click) {
            if (hit && hit.onClick) hit.onClick()
            return
        }

        if (hit) {
            if (!hit.isHover) {
                hit.isHover = true
                if (hit.onHover) hit.onHover()
                cursor = document.body.style.cursor
                document.body.style.cursor = 'pointer'
            }
            return
        }

        for (let i = 0; i < this.ids.length; i++) {
            let data = this.ids[i]

            if (data.isHover) {
                data.isHover = false
                if (data.onOut) data.onOut()
                document.body.style.cursor = cursor
            }
        }
    }

    reset() {
        this.ids.length = 0
        this.count = 0
    }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}
  

export default new GpuPicking()