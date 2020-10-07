import {Transform, Mesh, Program, Texture, Geometry, Text, Color, Vec3, Plane} from 'ogl'
import Uniforms from './uniforms'
import ColorMaterial from './color-material'

export default class MSDFText extends Transform {
    constructor(gl, options = {}) {
        super(gl)
        
        var program = options.program
        if (!program) {
            const texture = new Texture(gl, {
                image: options.image,
                generateMipmaps: false,
            })
            const shader = getShader(gl.renderer.isWebgl2)
            program = new Program(gl, {
                vertex: options.vertex || shader.vertex,
                fragment: options.fragment || shader.fragment,
                uniforms: Uniforms.merge({}, {
                    tMap: {value: texture},
                    uColor: {value: new Color(options.color || '#000000')},
                    uAlpha: {value: 1}
                }, options.uniforms),
                transparent: true,
                cullFace: null,
                depthWrite: false,
            })
        }


        let {
            font,
            align,
            letterSpacing,
            size,
            lineHeight,
            wordSpace,
            wordBreak,
            width
        } = options
        const text = new Text({
            text: options.text,
            font,
            align,
            letterSpacing,
            size,
            width,
            lineHeight,
            wordSpace,
            wordBreak,
        })

        const geometry = new Geometry(gl, {
            position: {size: 3, data: text.buffers.position},
            uv: {size: 2, data: text.buffers.uv},
            id: {size: 1, data: text.buffers.id},
            index: {data: text.buffers.index},
        })

        this.mesh = new Mesh(gl, {geometry, program})
        geometry.computeBoundingBox()
        this.text = text
        this.dimensions = new Vec3().sub(
            geometry.bounds.max,
            geometry.bounds.min
        )

        this.addChild(this.mesh)
        // this.addChild(this.createBbox(gl))
    }

    createBbox(gl, {opacity = 0.4, color = '#00ffff'} = {}) {
        let bbox = new Mesh(gl, {
            geometry: new Plane(gl, {
                width: this.width,
                height: this.height
            }),
            program: new ColorMaterial(gl, {
                color,
                opacity,
                transparent: true,
                depthWrite: false,
                depthTest: false
            })
        })
        // bbox.renderOrder = 9999
        bbox.position.y = -this.height * 0.5
        bbox.position.x = this.width * 0.5
        return bbox
    }

    get width() {
        return this.dimensions.x
    }

    get height() {
        return this.dimensions.y
    }
}

function getShader(isWebgl2) {
    return {
        vertex: `
      precision highp float;
      precision highp int;

      attribute vec2 uv;
      attribute vec3 position;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;

      varying vec2 vUv;

      void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
        fragment: `
      precision highp float;
      precision highp int;

      uniform sampler2D tMap;
      uniform vec3 uColor;
      uniform float uAlpha;

      varying vec2 vUv;

      void main() {

          vec3 tex = texture2D(tMap, vUv).rgb;
          float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
          float d = 0.001; // instead of expensive fwidth
          float alpha = smoothstep(-d, d, signedDist);

          if (alpha < 0.01) discard;

          gl_FragColor.rgb = uColor;
          gl_FragColor.a = alpha * uAlpha;
      }
  `
    }

    return isWebgl2
        ? {
              vertex: `#version 300 es
            precision highp float;
            precision highp int;
            in vec2 uv;
            in vec3 position;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            out vec2 vUv;
            void main() {
                vUv = uv;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
              fragment: `#version 300 es
            precision highp float;
            precision highp int;

            uniform sampler2D tMap;
            uniform vec3 uColor;
            uniform float uAlpha;

            in vec2 vUv;
            out vec4 color;

            void main() {
                vec3 tex = texture(tMap, vUv).rgb;
                float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
                float d = fwidth(signedDist);
                float alpha = smoothstep(-d, d, signedDist);
                if (alpha < 0.01) discard;
                color.rgb = uColor;
                color.a = alpha * uAlpha;
            }
        `,
          }
        : {
              vertex: `
            precision highp float;
            precision highp int;

            attribute vec2 uv;
            attribute vec3 position;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            varying vec2 vUv;

            void main() {
                vUv = uv;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
              fragment: `
            #extension GL_OES_standard_derivatives : enable

            precision highp float;
            precision highp int;

            uniform sampler2D tMap;
            uniform vec3 uColor;
            uniform float uAlpha;

            varying vec2 vUv;

            void main() {

                vec3 tex = texture2D(tMap, vUv).rgb;
                float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
                float d = fwidth(signedDist);
                float alpha = smoothstep(-d, d, signedDist);

                if (alpha < 0.01) discard;

                gl_FragColor.rgb = uColor;
                gl_FragColor.a = alpha * uAlpha;
            }
        `,
          }
}
