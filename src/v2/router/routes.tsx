import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

/**
 * Lazy-loaded page components.
 * Separated into their own exports to satisfy react-refresh.
 */
/** HomeV2Shell wires AppModeProvider, EntryGate, and the audio shell. */
export const LazyHomeV2 = lazy(() => import('../pages/HomeV2/HomeV2Shell'))
export const LazyProjectsV2 = lazy(() => import('../pages/ProjectsV2/ProjectsV2'))
export const LazyProjectDetailV2 = lazy(
  () => import('../pages/ProjectDetailV2/ProjectDetailV2'),
)
export const LazyClassicModePage = lazy(
  () => import('../pages/EditorialGlowup/EditorialGlowupPage'),
)

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
        fontFamily: "var(--v2-font-body, 'Proxima Nova', 'Inter', 'Arial', sans-serif)",
        fontStyle: 'italic',
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
    path: 'classic-mode',
    element: (
      <Suspense fallback={<PageFallback />}>
        <LazyClassicModePage />
      </Suspense>
    ),
  },
  {
    path: 'editorial-glowup',
    element: <Navigate to="/classic-mode" replace />,
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
]
