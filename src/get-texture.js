import { stage } from './stage'
import { Texture } from 'ogl'

export const textureCache = {}

const pixel = new Image()
pixel.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs='

export default function(image, params = {}) {
    let texture
    if (
        image instanceof Image ||
        image instanceof HTMLVideoElement ||
        image instanceof HTMLCanvasElement
    ) {
        texture = new Texture(stage.gl, image)
        setParams(texture, params)
        return texture
    } else {
        // Cache
        let texture = textureCache[image]
        if (texture) {
            let needsUpdate = Object.keys(params).reduce(function(
                reduce,
                key,
                i
            ) {
                let value = params[key]
                return reduce || value != texture[key]
            },
            false)
            setParams(texture, params)
            texture.needsUpdate = needsUpdate
            return texture
        }
        let img = new Image()
            texture = new Texture(stage.gl, pixel)
            textureCache[image] = texture
            texture.needsUpdate = false
            texture.promise = new Promise((resolve, reject) => {
                img.onload = function() {
                    img.onload = null
                    texture.image = img
                    setParams(texture, params)
                    resolve(texture)
                }
            })
            img.src = image
            return texture
    }
}

function setParams(texture, params = {}) {
    Object.assign(
        texture,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            generateMipmaps: false,
        },
        params
    )
}
