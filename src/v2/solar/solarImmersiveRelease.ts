/**
 * Release GPU memory and Drei/suspend-react loader caches when leaving immersive mode.
 * `useGLTF` keeps parsed scenes in cache; `<primitive object={scene} />` is not auto-disposed by R3F.
 */
import { peek } from 'suspend-react'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import type { Texture } from 'three'
import { GLTFLoader } from 'three-stdlib'
import type { GLTF } from 'three-stdlib'
import { useTexture } from '@react-three/drei'
import { SOLAR_GLB_MODEL_URLS } from './planetRegistry'
import { disposeObject3DDeep, disposeTexture } from './threeDisposal'
import { useGLTFV2 } from './useGLTFV2'

/** Milky Way equirect (NebulaBackground) — 2K para reducir el transfer en la carga inicial. */
export const NEBULA_STARS_TEXTURE_URL = '/assets/solar/textures/2k_stars_milky_way.jpg'

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

  // useLoader/suspend guarda el resultado de Promise.all → [Texture], no la textura suelta;
  // peek devuelve ese array; antes se pasaba a disposeTexture y fallaba (dispose no existe en Array).
  const nebulaPeek = peek([TextureLoader, NEBULA_STARS_TEXTURE_URL]) as Texture | Texture[] | undefined
  if (nebulaPeek) {
    const nebulaList = Array.isArray(nebulaPeek) ? nebulaPeek : [nebulaPeek]
    for (const t of nebulaList) {
      if (t instanceof THREE.Texture) disposeTexture(t)
    }
  }
  useTexture.clear(NEBULA_STARS_TEXTURE_URL)

  const uranusBatch = peek([TextureLoader, ...URANUS_DETAIL_TEXTURE_URLS]) as
    | Texture
    | Texture[]
    | undefined
  if (uranusBatch) {
    const list = Array.isArray(uranusBatch) ? uranusBatch : [uranusBatch]
    for (const t of list) {
      if (t instanceof THREE.Texture) disposeTexture(t)
    }
  }
  useTexture.clear([...URANUS_DETAIL_TEXTURE_URLS])
}
