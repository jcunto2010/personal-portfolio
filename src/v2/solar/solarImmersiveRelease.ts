/**
 * Release GPU memory and Drei/suspend-react loader caches when leaving immersive mode.
 * `useGLTF` keeps parsed scenes in cache; `<primitive object={scene} />` is not auto-disposed by R3F.
 */
import { peek } from 'suspend-react'
import { TextureLoader } from 'three'
import type { Texture } from 'three'
import { GLTFLoader } from 'three-stdlib'
import type { GLTF } from 'three-stdlib'
import { useTexture } from '@react-three/drei'
import { SOLAR_GLB_MODEL_URLS } from './planetRegistry'
import { disposeObject3DDeep, disposeTexture } from './threeDisposal'
import { useGLTFV2 } from './useGLTFV2'

/** Milky Way equirect (NebulaBackground). */
export const NEBULA_STARS_TEXTURE_URL = '/assets/solar/textures/8k_stars_milky_way.jpg'

/** Uranus procedural layers (UranusGuaranteedMesh). */
export const URANUS_DETAIL_TEXTURE_URLS = [
  '/assets/solar/textures/uranus/tex0.jpg',
  '/assets/solar/textures/uranus/tex1.png',
  '/assets/solar/textures/uranus/tex2.jpg',
] as const

/**
 * Peek cached GLTF → dispose scene GPU + blob textures → clear Drei `useGLTF` entry.
 * Peek cached TextureLoader results → dispose → clear `useTexture` entry.
 * Safe to call when caches are empty (e.g. safe mode).
 */
export function releaseSolarImmersiveAssets(): void {
  for (const path of SOLAR_GLB_MODEL_URLS) {
    const gltf = peek([GLTFLoader, path]) as GLTF | undefined
    if (gltf?.scene) {
      disposeObject3DDeep(gltf.scene)
    }
    useGLTFV2.clear(path)
  }

  const nebula = peek([TextureLoader, NEBULA_STARS_TEXTURE_URL]) as Texture | undefined
  if (nebula) disposeTexture(nebula)
  useTexture.clear(NEBULA_STARS_TEXTURE_URL)

  const uranusBatch = peek([TextureLoader, ...URANUS_DETAIL_TEXTURE_URLS]) as
    | Texture
    | Texture[]
    | undefined
  if (uranusBatch) {
    const list = Array.isArray(uranusBatch) ? uranusBatch : [uranusBatch]
    for (const t of list) {
      if (t?.isTexture) disposeTexture(t)
    }
  }
  useTexture.clear([...URANUS_DETAIL_TEXTURE_URLS])
}
