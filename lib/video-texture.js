import {Texture} from 'ogl'
import Ticker from './ticker'
const Emitter = require('tiny-emitter')

export default class VideoTexture extends Texture {
    constructor(gl, options = {}) {
        super(gl, {
            generateMipmaps: false,
            width: 720,
            height: 405
        })
        Object.assign(VideoTexture.prototype, Emitter.prototype)

        // TODO if webgl1, make square

        this.video = options.video

        this.video.addEventListener('pause', () => {
            this.isPlaying = false
        })

        this.video.addEventListener('playing', () => {
            this.isPlaying = true

            if (this.isSeeking) {
                this.isSeeking = false
                this.emit('seeked')
                return
            }
            if (this.isLoading && this.loadTime < 60) {
                this.isLoading = false
                clearTimeout(this.loadTimer)
                this.loadTimer = setTimeout(() => {
                    this.emit('playing')
                }, 1000)
                return
            }
            this.emit('playing')
        })
        this.video.addEventListener('waiting', () => {
            if (this.isSeeking) return
            clearTimeout(this.loadTimer)
            this.loadTime = 0
            this.isLoading = true
            this.emit('loading')
        })
        // this.video.addEventListener('ended', event => {
        //     this.emit('ended', event)
        // })
        this.video.addEventListener('timeupdate', event => {
            this.emit('timeupdate', event)
        })
        this.video.addEventListener('canplay', event => {
            this.emit('canplay', event)
        })

        this.visible = true
        this.isSeeking = false
        this.isLoading = false
        this.isPlaying = false
        this.loadTime = 0
        this.loadTimer = -1
        this.interval = -1
        this.updateVideo = ::this.updateVideo
        
        if (options.autoplay) this.play()
    }

    load() {
        this.video.load()
    }

    play() {
        let canPlay = this.video.paused && !this.isPlaying
        // if (!canPlay) return

        clearTimeout(this.loadTimer)
        clearInterval(this.interval)
        this.interval = setInterval(this.updateVideo, 1000 / 29.97)
console.log('play...');
        return this.video.play()
    }
    
    pause() {
        let canPause = !this.video.paused && this.isPlaying
        // if (!canPause) return
console.log('pause...');
        clearInterval(this.interval)
        return this.video.pause()
    }

    seek(time) {
        this.isSeeking = true
        this.video.currentTime = time
    }
    
    advance(timeIncrement) {
        this.isSeeking = true
        this.video.currentTime += timeIncrement
    }

    get duration() {
        return 5//this.videoTexture.duration
    }

    updateVideo() {
        if (this.isLoading) this.loadTime++;

        if (this.video.currentTime >= this.duration) {
            this.emit('ended')
            this.pause()
            this.video.currentTime = 0
        }

        if (!this.visible) return

        if (this.video.readyState >= this.video.HAVE_ENOUGH_DATA) {
            if (!this.image) this.image = this.video
            this.needsUpdate = true
        }
    }
}