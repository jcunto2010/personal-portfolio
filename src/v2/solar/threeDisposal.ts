/**
 * Deep disposal for Three.js object graphs (GLTF scenes, etc.).
 * R3F does not dispose `<primitive object={scene} />` — callers must free GPU + blob URLs.
 */
import * as THREE from 'three'

function revokeBlobIfNeeded(texture: THREE.Texture): void {
  const img = texture.image as { src?: string } | undefined
  if (img && typeof img.src === 'string' && img.src.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(img.src)
    } catch {
      /* ignore */
    }
  }
}

/** Disposes a texture and revokes `blob:` sources created by GLTFLoader for embedded images. */
export function disposeTexture(texture: THREE.Texture): void {
  if (!(texture instanceof THREE.Texture) || typeof texture.dispose !== 'function') return
  revokeBlobIfNeeded(texture)
  texture.dispose()
}

function disposeMaterial(material: THREE.Material): void {
  const record = material as unknown as Record<string, unknown>
  for (const key of Object.keys(material)) {
    if (key === 'uniforms') continue
    const val = record[key]
    if (val && typeof val === 'object' && 'isTexture' in (val as object) && (val as THREE.Texture).isTexture) {
      disposeTexture(val as THREE.Texture)
    }
  }
  if ('uniforms' in material && (material as THREE.ShaderMaterial).uniforms) {
    for (const u of Object.values((material as THREE.ShaderMaterial).uniforms)) {
      const v = (u as { value?: unknown }).value
      if (v && typeof v === 'object' && 'isTexture' in (v as object) && (v as THREE.Texture).isTexture) {
        disposeTexture(v as THREE.Texture)
      }
    }
  }
  material.dispose()
}

/**
 * Disposes geometries and materials under `root` (meshes + common line/point types).
 */
export function disposeObject3DDeep(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      for (const m of materials) {
        if (m) disposeMaterial(m)
      }
      return
    }
    if (child instanceof THREE.Line) {
      child.geometry?.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      for (const m of materials) {
        if (m) disposeMaterial(m)
      }
      return
    }
    if (child instanceof THREE.Points) {
      child.geometry?.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      for (const m of materials) {
        if (m) disposeMaterial(m)
      }
    }
  })
}
