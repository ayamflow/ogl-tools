import { stage } from './stage'
import { Triangle } from 'ogl'

const geometryCache = {}

export async function getGeometry(path, options = {}) {
    if (!geometryCache.quad) initCommon()
    
    let geometry = geometryCache[path]
    if (geometry) return geometry

    let extension = path.split('.').pop()
    let loader

    return new Promise(async (resolve, reject) => {
        switch(extension) {
            case 'json':
                throw new Error('JSON Loader is not supported anymore')
                // let data = await fetch(path)
                // loader = new JSONLoader()
                // geometry = loader.parse(data).geometry
                // geometryCache[path] = geometry
                // resolve(geometry)
                break
    
            case 'glb':
            case 'gltf':
                // loader = new GLTFLoader()
                // console.log('getgeom', options);
                // gltfpack compatibility
                // if (options.decoder) loader.setMeshoptDecoder(options.decoder)
                // loader.load(path, gltf => {
                //     geometryCache[path] = gltf
                //     resolve(gltf)
                // })
                break
        }
    })
}

function initCommon() {
    geometryCache.quad = new Triangle(stage.gl)
}