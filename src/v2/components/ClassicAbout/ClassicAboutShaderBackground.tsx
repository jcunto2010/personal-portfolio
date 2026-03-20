import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import styles from './ClassicAbout.module.css'

export function ClassicAboutShaderBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isSmallViewport = window.innerWidth < 768
    if (prefersReduced || isSmallViewport) return

    const camera = new THREE.Camera()
    camera.position.z = 1
    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        #define TWO_PI 6.2831853072
        #define PI 3.14159265359

        precision highp float;
        uniform vec2 resolution;
        uniform float time;

        float random(in float x) {
          return fract(sin(x) * 1e4);
        }

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main(void) {
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

          vec2 fMosaicScal = vec2(4.0, 2.0);
          vec2 vScreenSize = vec2(256.0, 256.0);
          uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
          uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

          float t = time * 0.06 + random(uv.x) * 0.4;
          float lineWidth = 0.0008;

          vec3 color = vec3(0.0);
          for (int j = 0; j < 3; j++) {
            for (int i = 0; i < 5; i++) {
              color[j] += lineWidth * float(i * i) / abs(fract(t - 0.01 * float(j) + float(i) * 0.01) - length(uv));
            }
          }

          vec3 palette = vec3(
            color[0] * 0.55 + color[2] * 0.35,
            color[1] * 0.8,
            color[2] * 0.85 + color[1] * 0.2
          );
          gl_FragColor = vec4(palette, 1.0);
        }
      `,
      transparent: true,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    let running = true
    let inViewport = true
    const targetFps = 30
    const frameMs = 1000 / targetFps
    let lastTs = 0
    let rafId = 0

    const resize = () => {
      const rect = container.getBoundingClientRect()
      renderer.setSize(rect.width, rect.height)
      const pixelRatio = renderer.getPixelRatio()
      uniforms.resolution.value.x = Math.max(1, rect.width * pixelRatio)
      uniforms.resolution.value.y = Math.max(1, rect.height * pixelRatio)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    const observer = new IntersectionObserver(
      (entries) => {
        inViewport = entries.some((entry) => entry.isIntersecting)
      },
      { threshold: 0.01 },
    )
    observer.observe(container)

    const onVisibility = () => {
      running = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', resize)

    const render = (ts: number) => {
      rafId = requestAnimationFrame(render)
      if (!running || !inViewport) return
      if (ts - lastTs < frameMs) return
      lastTs = ts

      uniforms.time.value += 0.05
      renderer.render(scene, camera)
    }
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', resize)
      scene.remove(mesh)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} className={styles.shaderLayer} aria-hidden="true" />
}

