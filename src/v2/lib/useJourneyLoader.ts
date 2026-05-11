import { useCallback, useRef, useState } from 'react'
import type { AppMode } from './appModeContext'
import { projectsV2 } from '../data/projects.v2'

type JourneyStatus = 'idle' | 'loading' | 'ready' | 'error'

interface JourneyLoaderSnapshot {
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

interface JourneyLoaderController extends JourneyLoaderSnapshot {
  /** Start (or restart) loading for the current mode. */
  start: () => void
  /** Reset back to idle; does not clear any underlying caches. */
  reset: () => void
}

let immersiveBundleLoaded = false
let classicAssetsLoaded = false

async function preloadImmersiveBundle(): Promise<void> {
  if (immersiveBundleLoaded) return
  await import('../solar/SolarScene')
  immersiveBundleLoaded = true
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

async function preloadClassicAssets(): Promise<void> {
  if (classicAssetsLoaded) return

  const heroImage =
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&h=1200&fit=crop&crop=faces&auto=format&q=80'

  const projectImages = projectsV2.flatMap((project) => [
    project.coverImage,
    ...(project.thumbnails?.map((t) => t.src) ?? []),
  ])

  const uniqueSources = Array.from(new Set([heroImage, ...projectImages]))
  await Promise.all(uniqueSources.map((src) => preloadImage(src)))

  classicAssetsLoaded = true
}

export function useJourneyLoader(mode: AppMode): JourneyLoaderController {
  const [status, setStatus] = useState<JourneyStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  /** Invalida callbacks async de un start/reset anterior (p. ej. volver al gate mientras carga). */
  const loadGenerationRef = useRef(0)

  const start = useCallback(() => {
    loadGenerationRef.current += 1
    const gen = loadGenerationRef.current
    setError(null)

    const applyReady = () => {
      if (loadGenerationRef.current !== gen) return
      setStatus('ready')
    }
    const applyError = (msg: string) => {
      if (loadGenerationRef.current !== gen) return
      setError(msg)
      setStatus('error')
    }

    if (mode === 'non-immersive') {
      setStatus('loading')
      const minDelayMs = 700
      const startedAt = performance.now()

      preloadClassicAssets()
        .then(() => {
          const elapsed = performance.now() - startedAt
          const waitMs = Math.max(0, minDelayMs - elapsed)
          window.setTimeout(applyReady, waitMs)
        })
        .catch(() => {
          // If some image fails, still allow entry; remaining images lazy-load.
          applyReady()
        })
      return
    }

    if (mode === 'immersive') {
      setStatus('loading')
      preloadImmersiveBundle()
        .then(applyReady)
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err)
          applyError(msg)
        })
      return
    }

    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(applyReady)
    } else {
      applyReady()
    }
  }, [mode])

  const reset = useCallback(() => {
    loadGenerationRef.current += 1
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
          ? 'Precargando recursos visuales del modo clásico.'
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

