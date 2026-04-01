/**
 * Drei useGLTF with V2 loader extensions (KHR_materials_pbrSpecularGlossiness plugin, etc.).
 * Draco + Meshopt enabled. Decoder Draco servido desde `/draco/` (mismo origen) para cumplir CSP
 * (`connect-src` no permite gstatic en index.html). Ver `scripts/copy-draco.mjs`.
 */
import { useGLTF } from '@react-three/drei'
import { extendGltfLoaderWithV2Extensions } from './gltfLoaderExtensions'

/** Same-origin path to Draco WASM/JS (public/draco → /draco/ in prod). */
const DRACO_DECODER_PATH = `${import.meta.env.BASE_URL}draco/`

export function useGLTFV2(path: string) {
  return useGLTF(path, DRACO_DECODER_PATH, true, extendGltfLoaderWithV2Extensions)
}

useGLTFV2.preload = (path: string) => {
  useGLTF.preload(path, DRACO_DECODER_PATH, true, extendGltfLoaderWithV2Extensions)
}

useGLTFV2.clear = (path: string) => {
  useGLTF.clear(path)
}

useGLTFV2.setDecoderPath = useGLTF.setDecoderPath
