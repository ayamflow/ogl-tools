import {Geometry} from 'ogl'

export default function cloneGeometry(geometry) {
    let attributes = geometry.attributes
    let newAttributes = {}
    for (let key in attributes) {
        newAttributes[key] = {
            size: attributes[key].size,
            data: new attributes[key].data.constructor(attributes[key].data)
        }
    }
    return new Geometry(geometry.gl, newAttributes)   
}