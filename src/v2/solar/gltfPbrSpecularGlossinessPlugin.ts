import type { GLTFLoader, GLTFLoaderPlugin } from 'three-stdlib'

/**
 * KHR_materials_pbrSpecularGlossiness was removed from three.js GLTFLoader (archived extension).
 * Registering a named plugin satisfies the loader's plugin table so required extensions do not log
 * "Unknown extension" (three-stdlib GLTFLoader.js). Materials still resolve via default
 * metallic-roughness; for exact spec/gloss shading, re-export GLBs as metal/rough from Blender.
 */
const KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS = 'KHR_materials_pbrSpecularGlossiness'

export function registerKhrMaterialsPbrSpecularGlossinessPlugin(loader: GLTFLoader): void {
  loader.register(
    (): GLTFLoaderPlugin & { name: string } =>
      ({
        name: KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,
      }) as GLTFLoaderPlugin & { name: string },
  )
}
