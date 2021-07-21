import { Program, Color } from 'ogl'
import { Pane } from 'tweakpane'
import * as TweakpaneImagePlugin from 'tweakpane-image-plugin'

var GUI
if (typeof window !== 'undefined') {
    GUI = new Pane({ expanded: false });
    GUI.element.parentNode.style.zIndex = 999
    GUI.registerPlugin(TweakpaneImagePlugin);
}

export class Shader extends Program {
    constructor(gl, options = {}) {
        let useGUI = options.useGUI
        delete options.useGUI

        // const precision = options.precision || 'highp'

        super(gl,  Object.assign({
            vertex: options.vertex || Shader.defaultVertex,
            fragment: options.fragment || Shader.defaultFragment,
        }, options))

        this.name = options.name
            || this.constructor.name
            || this.constructor.toString().match(/function ([^\(]+)/)[1]

        checkUniforms(this.name, options.uniforms)

        if (useGUI !== false) {
            this.addGUI(options)
        }
    }

    addGUI(options) {
        if (!GUI) return
        
        // create panel and controls to GUI
        let folder = GUI.addFolder({
            title: this.name || this.uuid,
            expanded: false,
        })

        for (let uniform in this.uniforms) {
            let obj = this.uniforms[uniform]
            if (obj.useGUI === false) continue
            if (obj.value === null || obj.value === undefined) continue

            if (typeof obj.value === 'number') {
                folder.addInput(obj, 'value', {
                    label: uniform,
                    step: 0.001,
                    min: obj.min || obj.value - 10,
                    max: obj.max || obj.value + 10,
                })
            } else if (obj.value instanceof Color) {
                let color = {
                    value: {
                        r: obj.value.r * 255,
                        g: obj.value.g * 255,
                        b: obj.value.b * 255,
                    }
                }
                folder.addInput(color, 'value', { label: uniform })
                    .on('change', () => {
                        obj.value.set(
                            color.value.r / 255,
                            color.value.g / 255,
                            color.value.b / 255,
                        )
                    })
            } else if (obj.value.image) {
                folder.addInput(obj.value, 'image', { label: uniform })
            } else {
                if (obj.value.wrapS) continue
                
                folder.addInput(obj, 'value', { label: uniform })
            }
        }
    }

    /**
     * Set an uniform's value
     *
     * @param {*} key
     * @param {*} value
     * @memberof Shader
     */
    set(key, value) {
        this.uniforms[key].value = value.texture ? value.texture : value
    }
    
    /**
     * Return an uniform's value
     *
     * @param {*} key
     * @return {*} 
     * @memberof Shader
     */
    get(key) {
        return this.uniforms[key].value
    }
}

function checkUniforms(name, uniforms) {
    for (let uniform in uniforms) {
        let obj = uniforms[uniform]
        if (obj.value === undefined) {
            throw new Error(
                `[Shader ${name}] Incorrect uniform ${uniform}`,
                obj
            )
        }
    }
}

// function parseGlslifyImport(shader) {
//     shader.replace(GLSLIFY_REGEX, '#pragma glslify: $1 = require($2)')
// }

Object.assign(Shader, {
    /**
     * @memberof Shader
     * @type {string}
     * @static {string} Shader.defaultVertexShader
     */
    defaultVertex: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    /**
     * @memberof Shader
     * @type {string}
     * @static {string} Shader.quadVertexShader
     */
    quadVertex: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `,
    /**
     * @memberof Shader
     * @type {string}
     * @static {string} Shader.defaultFragmentShader
     */
    defaultFragment: `
        varying vec2 vUv;

        void main() {
            gl_FragColor = vec4(vUv, 0.0, 1.0);
        }
    `,
    /**
     * @memberof Shader
     * @type {string}
     * @static {string} Shader.quadFragmentShader
     */
    quadFragment: `
        uniform sampler2D tMap;
        uniform float uAlpha;
        varying vec2 vUv;

        void main() {
            gl_FragColor = texture2D(tMap, vUv);
            gl_FragColor.a *= uAlpha;
        }
    `
})

// TBD
function addPrecision(shader, precision) {
    if (shader.includes('#version 300 es')) {
        return `#version 300 es\nprecision ${precision} float;`
        + shader.replace('#version 300 es', '')
    }

    return `precision ${precision} float;\n${shader}`
}

export function toggleGUI(value) {
    GUI.expanded = value
}