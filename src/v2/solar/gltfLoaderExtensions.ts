import type { GLTFLoader } from 'three-stdlib'
import { registerKhrMaterialsPbrSpecularGlossinessPlugin } from './gltfPbrSpecularGlossinessPlugin'

/** Applied to every Drei useGLTF path in V2 so archived GLTF extensions do not warn in console. */
export function extendGltfLoaderWithV2Extensions(loader: GLTFLoader): void {
  registerKhrMaterialsPbrSpecularGlossinessPlugin(loader)
}
