/**
 * Drei useGLTF with V2 loader extensions (KHR_materials_pbrSpecularGlossiness plugin, etc.).
 * Signature matches useGLTF defaults: Draco + Meshopt enabled.
 */
import { useGLTF } from '@react-three/drei'
import { extendGltfLoaderWithV2Extensions } from './gltfLoaderExtensions'

export function useGLTFV2(path: string) {
  return useGLTF(path, true, true, extendGltfLoaderWithV2Extensions)
}

useGLTFV2.preload = (path: string) => {
  useGLTF.preload(path, true, true, extendGltfLoaderWithV2Extensions)
}

useGLTFV2.clear = (path: string) => {
  useGLTF.clear(path)
}
