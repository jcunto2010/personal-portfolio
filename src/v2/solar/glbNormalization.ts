/**
 * glbNormalization — pure helpers for GLB scene normalisation.
 *
 * These helpers are free of React state and can be imported by any module.
 * They must NOT mutate the shared useGLTF scene object.
 */

import * as THREE from 'three'

export interface NormParams {
  offsetX: number
  offsetY: number
  offsetZ: number
  /** Scale that maps the GLB dominant axis to 2*normalizedRadiusTarget units. */
  normScale: number
  sizeX: number
  sizeY: number
  sizeZ: number
  /** Approximate radius = half of dominant axis in GLB-native units. */
  radiusApprox: number
}

/**
 * Compute centring offset and normalisation scale for a GLB scene object.
 *
 * Pure — does NOT mutate the object. Safe to call on the shared useGLTF scene.
 *
 * The result maps the GLB so its dominant dimension == 2*normalizedRadiusTarget
 * scene units (radius = normalizedRadiusTarget). An outer artisticScale
 * multiplier is then applied separately in the Three.js group hierarchy:
 *
 *   outer group  → position + artisticScale
 *   inner group  → offsetX/Y/Z + normScale   ← this function's output
 *   primitive    → <primitive object={scene} />
 *
 * @param obj - the THREE.Object3D to measure (typically useGLTF(...).scene)
 * @param normalizedRadiusTarget - desired logical radius in normalised space.
 *   Default is 1.  Pass 0.8 etc. if the GLB should map to a smaller radius
 *   before the artistic scale is applied.
 */
export function computeNormParams(
  obj: THREE.Object3D,
  normalizedRadiusTarget = 1,
): NormParams {
  const box = new THREE.Box3().setFromObject(obj)
  if (box.isEmpty()) {
    return {
      offsetX: 0, offsetY: 0, offsetZ: 0,
      normScale: 1,
      sizeX: 0, sizeY: 0, sizeZ: 0,
      radiusApprox: 1,
    }
  }

  const center = new THREE.Vector3()
  const size   = new THREE.Vector3()
  box.getCenter(center)
  box.getSize(size)

  const maxDim       = Math.max(size.x, size.y, size.z)
  const radiusApprox = maxDim / 2
  const normScale    = maxDim > 0 ? (2 * normalizedRadiusTarget) / maxDim : 1

  return {
    offsetX: -center.x,
    offsetY: -center.y,
    offsetZ: -center.z,
    normScale,
    sizeX: size.x,
    sizeY: size.y,
    sizeZ: size.z,
    radiusApprox,
  }
}

/**
 * Disable frustum culling on every descendant of obj.
 * Prevents planets from disappearing when their bounding sphere drifts
 * outside the camera frustum due to an off-centre GLB pivot.
 */
export function disableFrustumCulling(obj: THREE.Object3D): void {
  obj.traverse((child) => { child.frustumCulled = false })
}
