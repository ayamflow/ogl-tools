import { ticker } from './ticker'
import touches from 'touches'
import sniffer from 'sniffer'
import Emitter from 'tiny-emitter'
const touch = touches(window, {filtered: true, preventSimulated: false})

export class Interaction extends Emitter {
    constructor() {
        super()
        this.items = []
        this.last = null

        this.addEvents()
    }
    
    addEvents() {
        this.onClick = this.onClick.bind(this)
        this.onUp = this.onUp.bind(this)
        this.onDown = this.onDown.bind(this)

        touch.on('start', this.onDown)
        touch.on('end', this.onUp)
        window.addEventListener('click', this.onClick)

        // For hover monitoring
        this.update = this.update.bind(this)
        ticker.add(this.update)
    }

    onClick(event) {
        if (Math.abs(event.pageX - this.last[0]) > 5 || Math.abs(event.pageY - this.last[1]) > 5) return // prevent "drag click"

        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            let mesh = item.mesh
            if (!mesh.visible) return
            let hits = stage.raycast(item.camera, mesh)
            if (hits[0]) {
                if (item.onClick) item.onClick(mesh)
            }
        }
    }

    onDown(event, pos) {
        this.last = pos
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            let mesh = item.mesh
            if (!mesh.visible) return
            let hits = stage.raycast(item.camera, mesh)
            if (hits[0]) {
                if (item.onDown) item.onDown(mesh)
            }
        }
    }

    onUp(event, pos) {
        if (sniffer.isIos) {
            if (pos[0] == this.last[0] && pos[1] == this.last[1]) {
                this.onClick()
            }
        }

        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            let mesh = item.mesh
            if (!mesh.visible) return
            let hits = stage.raycast(item.camera, mesh)
            if (hits[0]) {
                if (item.onUp) item.onUp(mesh)
            }
        }
    }

    add({camera, mesh, onClick, onHover, onOut, onDown, onUp}) {
        this.items.push({
            camera, mesh, onClick, onHover, onOut, onDown, onUp
        })
    }

    clear(mesh) {
        let item = this.items.filter(item => item.mesh == mesh)[0]
        if (item) mesh.isHover = false
    }

    update() {
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            
            let mesh = item.mesh
            if (!mesh.visible) return
            let hits = stage.raycast(item.camera, mesh)

            if (hits[0]) {
                if (!mesh.isHover) {
                    mesh.isHover = true
                    if (item.onHover) item.onHover(mesh)
                }
            } else if (mesh.isHover) {
                mesh.isHover = false
                if (item.onOut) item.onOut(mesh)
            }
        }
    }
}