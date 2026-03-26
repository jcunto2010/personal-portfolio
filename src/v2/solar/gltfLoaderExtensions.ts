import type { GLTFLoader } from 'three-stdlib'
import { registerKhrMaterialsPbrSpecularGlossinessPlugin } from './gltfPbrSpecularGlossinessPlugin'

/**
 * Draco: `@react-three/drei` registra su propio `DRACOLoader` cuando `useGLTF` recibe un string como
 * segundo argumento (ruta del decodificador). `useGLTFV2` pasa `'/draco/'` para evitar gstatic bajo CSP.
 */

/** Applied to every Drei useGLTF path in V2 so archived GLTF extensions do not warn in console. */
export function extendGltfLoaderWithV2Extensions(loader: GLTFLoader): void {
  registerKhrMaterialsPbrSpecularGlossinessPlugin(loader)
}
