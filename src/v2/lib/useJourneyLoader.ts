import { useCallback, useState } from 'react'
import type { AppMode } from './appModeContext'

export type JourneyStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface JourneyLoaderSnapshot {
  mode: AppMode
  status: JourneyStatus
  ready: boolean
  /** Human-readable primary label, e.g. "Cargando modo inmersivo…" */
  label: string
  /** Optional secondary line with more detail. */
  detail?: string
  /** 0–1 progress hint when available. For now we only expose coarse states. */
  progress?: number
  error: string | null
}

export interface JourneyLoaderController extends JourneyLoaderSnapshot {
  /** Start (or restart) loading for the current mode. */
  start: () => void
  /** Reset back to idle; does not clear any underlying caches. */
  reset: () => void
}

let immersiveBundleLoaded = false

async function preloadImmersiveBundle(): Promise<void> {
  if (immersiveBundleLoaded) return
  await import('../solar/SolarScene')
  immersiveBundleLoaded = true
}

export function useJourneyLoader(mode: AppMode): JourneyLoaderController {
  const [status, setStatus] = useState<JourneyStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(() => {
    setError(null)

    if (mode === 'non-immersive') {
      // Non-immersive mode has no heavy GLB / WebGL bundle. We still go
      // through a formal "loading" phase so the flow is consistent.
      setStatus('loading')

      // Promote to ready on the next animation frame to avoid layout jank.
      if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
        window.requestAnimationFrame(() => {
          setStatus('ready')
        })
      } else {
        setStatus('ready')
      }
      return
    }

    // Immersive mode: wait for the SolarScene bundle to be fetched and evaluated.
    setStatus('loading')
    preloadImmersiveBundle()
      .then(() => {
        setStatus('ready')
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
        setStatus('error')
      })
  }, [mode])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
  }, [])

  const snapshot: JourneyLoaderSnapshot = {
    mode,
    status,
    ready: status === 'ready',
    label:
      mode === 'immersive'
        ? status === 'ready'
          ? 'Inmersivo listo'
          : 'Cargando modo inmersivo…'
        : status === 'ready'
          ? 'Modo clásico listo'
          : 'Preparando modo clásico…',
    detail:
      mode === 'immersive'
        ? status === 'loading'
          ? 'Cargando motor 3D y escena solar inicial.'
          : status === 'ready'
            ? 'El viaje inmersivo puede comenzar sin pantallas rotas.'
            : status === 'error'
              ? 'No se pudo inicializar el modo inmersivo.'
              : undefined
        : status === 'loading'
          ? 'Inicializando layout editorial y tipografías.'
          : undefined,
    // For ahora no tenemos un contador granular fuera de SolarScene; usamos
    // estados discretos que dependen de carga real (bundle / frame).
    progress: status === 'ready' ? 1 : status === 'loading' ? 0.5 : 0,
    error,
  }

  return {
    ...snapshot,
    start,
    reset,
  }
}

