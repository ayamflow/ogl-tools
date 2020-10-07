import assets from 'lib/assets'
export const textureCache = {}

export default function(image, params = {}) {
    let texture
    if (
        image instanceof Image ||
        image instanceof HTMLVideoElement ||
        image instanceof HTMLCanvasElement
    ) {
        texture = new THREE.Texture(image)
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
        texture = new THREE.Texture(assets.get(image))
    }

    setParams(texture, params)
    texture.needsUpdate = true
    return texture
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
