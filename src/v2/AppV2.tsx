import { HashRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import {
  LazyHomeV2,
  LazyProjectsV2,
  LazyProjectDetailV2,
  LazySmokeTest,
  PageFallback,
} from './router/routes'
import './tokens/tokens.css'
import { LocaleProvider } from './lib/localeContext'

/**
 * AppV2 — root of Portfolio V2.
 *
 * Mounted from index.html → main.v2.tsx (canonical app entry).
 *
 * Uses HashRouter so the router reads the hash fragment (#/, #/projects, etc.)
 * rather than the real pathname (SPA-friendly on static hosts).
 *
 * Migration path: swap HashRouter for BrowserRouter with basename="/" when
 * moving to history-based routing with server fallback to index.html.
 *
 * The `.v2-root` class activates all V2 CSS custom properties defined
 * in tokens/tokens.css.
 */

function V2Layout() {
  return (
    <div className="v2-root">
      <Outlet />
    </div>
  )
}

export default function AppV2() {
  return (
    <LocaleProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<V2Layout />}>
            <Route
              index
              element={
                <Suspense fallback={<PageFallback />}>
                  <LazyHomeV2 />
                </Suspense>
              }
            />
            <Route
              path="projects"
              element={
                <Suspense fallback={<PageFallback />}>
                  <LazyProjectsV2 />
                </Suspense>
              }
            />
            <Route
              path="projects/:slug"
              element={
                <Suspense fallback={<PageFallback />}>
                  <LazyProjectDetailV2 />
                </Suspense>
              }
            />
            {/* Fase 0 — smoke test temporal. Eliminar tras validar assets. */}
            <Route
              path="smoke-test"
              element={
                <Suspense fallback={<PageFallback />}>
                  <LazySmokeTest />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </HashRouter>
    </LocaleProvider>
  )
}
