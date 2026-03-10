import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'

/**
 * Lazy-loaded page components.
 * Separated into their own exports to satisfy react-refresh.
 */
/** Phase 1+: HomeV2Shell includes AppModeProvider + EntryGate + audio. */
export const LazyHomeV2 = lazy(() => import('../pages/HomeV2/HomeV2Shell'))
export const LazyProjectsV2 = lazy(() => import('../pages/ProjectsV2/ProjectsV2'))
export const LazyProjectDetailV2 = lazy(
  () => import('../pages/ProjectDetailV2/ProjectDetailV2'),
)
/** Fase 0 — smoke test temporal. Eliminar tras validar assets. */
export const LazySmokeTest = lazy(() => import('../pages/SmokeTest/SmokeTestGLB'))

export function PageFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070B1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#B8C0D9',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '0.875rem',
        letterSpacing: '0.08em',
      }}
    >
      Loading…
    </div>
  )
}

export const v2Routes: RouteObject[] = [
  {
    index: true,
    element: (
      <Suspense fallback={<PageFallback />}>
        <LazyHomeV2 />
      </Suspense>
    ),
  },
  {
    path: 'projects',
    element: (
      <Suspense fallback={<PageFallback />}>
        <LazyProjectsV2 />
      </Suspense>
    ),
  },
  {
    path: 'projects/:slug',
    element: (
      <Suspense fallback={<PageFallback />}>
        <LazyProjectDetailV2 />
      </Suspense>
    ),
  },
  {
    path: 'smoke-test',
    element: (
      <Suspense fallback={<PageFallback />}>
        <LazySmokeTest />
      </Suspense>
    ),
  },
]
