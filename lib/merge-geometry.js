import {Geometry} from 'ogl'
import cloneGeometry from './clone-geometry'

export default function mergeGeometry(geometry1, geometry2) {
    if (geometry1.geometry) return mergeMesh(geometry1, geometry2)
    return merge(geometry1, geometry2)
}

function merge(geometry1, geometry2) {
    let attributes1 = geometry1.attributes
    let attributes2 = geometry2.attributes
    let offset = attributes1.position.count

    for (let key in attributes1) {
        if (geometry2.attributes[key] === undefined ) continue

        let attr1 = attributes1[key].data
        let attr2 = attributes2[key].data

        if (key == 'index') {
            for (let i = 0; i < attr2.length; i++) {
                attr2[i] += offset
            }
        }

        let ArrayType = attr1.constructor
        let data = new ArrayType(attr1.length + attr2.length)
        data.set(attr1)
        data.set(attr2, attr1.length)
        attributes1[key].data = data
        let count = attributes1[key].count = attributes1[key].data.length / attributes1[key].size
    }

    return new Geometry(geometry1.gl, geometry1.attributes)
}

function mergeMesh(mesh1, mesh2) {
    let geometries = [mesh1, mesh2].map(mesh => {
        let geometry = cloneGeometry(mesh.geometry)

        let position = geometry.attributes.position
        let data = position.data
        let pos = mesh.position
        for (let i = 0; i < data.length; i += position.size) {
            data[i + 0] += pos[0]
            data[i + 1] += pos[1]
            data[i + 2] += pos[2]
        }
        geometry.updateAttribute(geometry.attributes.position)
        return geometry
        // mesh.geometry.addAttribute('offset', {
        //     size: 3,
        //     data: Float32Array.from(mesh.position)
        // })
        // mesh.geometry.addAttribute('rotation', {
        //     size: 3,
        //     data: new Float32Array([mesh.rotation.x, mesh.rotation.y, mesh.rotation.z])
        // })
        // mesh.geometry.addAttribute('scale', {
        //     size: 3,
        //     data: Float32Array.from(mesh.scale)
        // })
    })

    return merge(...geometries)
}