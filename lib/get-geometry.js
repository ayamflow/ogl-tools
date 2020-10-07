import assets from 'lib/assets'
const geometryCache = {}

export default function(path, cb) {
    let geometry = geometryCache[path]
    if (geometry) return geometry

    let data = assets.get(path)
    let extension = path.split('.').pop()
    let dir = path.split('/')
    let root =
        process.env.paths.assetsURL +
        dir.slice(0, dir.length - 1).join('/') +
        '/'
    let parser

    switch (extension) {
        case 'json':
            parser = new THREE.JSONLoader()
            geometry = parser.parse(data).geometry
            geometryCache[path] = geometry
            cb(geometry)
            break

        case 'glb':
        case 'gltf':
            parser = new THREE.GLTFLoader()
            parser.parse(data, root, (gltf) => {
                geometryCache[path] = gltf
                cb(gltf)
            })
            break
    }
}
