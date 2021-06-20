import size from 'size'
import stage from './stage'
import {Vec3} from 'ogl'

// https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269
function height(depth, camera) {
    // compensate for cameras not positioned at z=0
    const cameraOffset = camera.position.z
    if (depth < cameraOffset) depth -= cameraOffset
    else depth += cameraOffset

    // vertical fov in radians
    const vFOV = (camera.fov * Math.PI) / 180

    // Math.abs to ensure the result is always positive
    return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
}

function width(depth, camera) {
    const h = height(depth, camera)
    return h * camera.aspect
}

const vector = new Vec3()
function screenToWorld(x, y, camera) {
    vector.set((x / size.width) * 2 - 1, -(y / size.height) * 2 + 1, 0.5)

    // Do this before calling this method
    // camera.updateMatrixWorld()
    // camera.updateProjectionMatrix()

    camera.unproject(vector)
    let dir = vector.sub(camera.position).normalize()
    let distance = -camera.position.z / dir.z
    let pos = camera.position.clone().add(dir.multiply(distance))

    return pos
}

function worldToScreen(object, camera) {
    vector.setFromMatrixPosition(object.matrixWorld)
    camera.project(vector)

    let bufferSize = stage.renderer.getDrawingBufferSize()
    let halfWidth = bufferSize * 0.5
    let halfHeight = canvasHeight * 0.5

    vector.x = vector.x * halfWidth + halfWidth
    vector.y = -(vector.y * halfHeight) + halfHeight
    vector.z = 0

    return vector.clone()
}

export default {
    height,
    width,
    screenToWorld,
    worldToScreen,
}
