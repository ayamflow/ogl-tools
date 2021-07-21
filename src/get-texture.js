import { stage } from './stage'
import { Texture } from 'ogl'

export const textureCache = {}
const parsers = {}

var emptyImage

const exts = ['jpg', 'jpeg', 'png']

export async function getTexture(image, params = {}) {
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
            ) {
                let value = params[key]
                return reduce || value != texture[key]
            },
            false)
            setParams(texture, params)
            texture.needsUpdate = needsUpdate
            return texture
        }

        const ext = image.split('.').pop()
        if (exts.indexOf(ext) < 0) {
            if (!parsers[ext]) {
                throw new Error(`[getTexture] no parser for image extension .${ext}.`)
            } else {
                const texture = await parsers[ext](image)
                textureCache[image] = texture
                return texture
            }
        } else {
            let img = new Image()
            if (!emptyImage) {
                emptyImage = new Image()
                emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs='
            }
            texture = new Texture(stage.gl, emptyImage)
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
            await texture.promise
            return texture
        }
    }
}

export function addCustomParser(exts, cb) {
    const extensions = Array.isArray(exts) ? exts : [exts]
    extensions.forEach(ext => parsers[ext] = cb)
}

function setParams(texture, params = {}) {
    Object.assign(
        texture,
        {
            minFilter: stage.gl.LINEAR,
            magFilter: stage.gl.LINEAR,
            wrapS: stage.gl.CLAMP_TO_EDGE,
            wrapT: stage.gl.CLAMP_TO_EDGE,
            generateMipmaps: false,
        },
        params
    )
}
