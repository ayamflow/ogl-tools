import Uniforms from './uniforms'
// import Controlkit from 'controlkit'
import sniffer from 'sniffer'
const THREE = {} // DEBUG

// const GLSLIFY_REGEX = /#import ([a-zA-Z0-9_-]+) from ([a-zA-Z0-9_-]+)/g
// const GUI = new Controlkit().addPanel()
// if (!sniffer.isDesktop || process.env.ENV != 'dev') GUI.disable()
// GUI.disable()

export default class Shader extends THREE.ShaderMaterial {
    constructor(options = {}) {
        let useGUI = options.useGUI
        delete options.useGUI

        super(
            Object.assign(
                {
                    vertexShader:
                        options.vertexShader || Shader.defaultVertexShader,
                    fragmentShader:
                        options.fragmentShader || Shader.defaultFragmentShader,
                },
                options
            )
        )

        this.name =
            options.name ||
            this.constructor.name ||
            this.constructor.toString().match(/function ([^\(]+)/)[1]
        checkUniforms(this.name, options.uniforms)

        if (useGUI !== false) {
            // console.log(`[Shader] ${this.name} addGUI`);
            this.addGUI(options)
        }

        // TODO
        // HMR?
    }

    addGUI(options) {
        return

        // create panel and controls to GUI
        let panel = GUI.addGroup({
            label: this.name || this.uuid,
            enable: false,
        })

        for (let uniform in this.uniforms) {
            let obj = this.uniforms[uniform]
            if (obj.useGUI === false) continue

            if (obj.value === null || obj.value === undefined) continue

            if (obj.value.isVector2) {
                // 2x number
                panel
                    .addSubGroup()
                    .addNumberInput(obj.value, 'x', {
                        label: uniform + ' x',
                    })
                    .addNumberInput(obj.value, 'y', {
                        label: uniform + ' y',
                    })
            } else if (obj.value.isVector3) {
                // 3x number
                panel
                    .addSubGroup()
                    .addNumberInput(obj.value, 'x', {
                        label: uniform + ' x',
                    })
                    .addNumberInput(obj.value, 'y', {
                        label: uniform + ' y',
                    })
                    .addNumberInput(obj.value, 'z', {
                        label: uniform + ' z',
                    })
            } else if (obj.value.isColor) {
                // color
                // a bit more logic to work with THREE.Color

                let color = {
                    value: [obj.value.r, obj.value.g, obj.value.b],
                }
                panel.addColor(color, 'value', {
                    label: uniform,
                    colorMode: 'rgb',
                    onChange: function() {
                        obj.value.setRGB(
                            color.value[0] / 256,
                            color.value[1] / 256,
                            color.value[2] / 256
                        )
                    },
                })
            } else if (obj.value === true || obj.value === false) {
                // checkbox
                panel.addCheckbox(obj, 'value', {
                    label: uniform,
                })
            } else if (typeof obj.value == 'number') {
                // number
                panel.addNumberInput(obj, 'value', {
                    label: uniform,
                    dp: 5,
                    step: 0.001,
                })
            }
        }
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
    defaultVertexShader: `
        attribute vec2 uv;
        attribute vec3 position;
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    defaultFragmentShader: `
        precision highp float;

        varying vec2 vUv;

        void main() {
            gl_FragColor = vec4(vUv, 0.0, 1.0);
        }
    `,
})
