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

/**
 * AppV2 — root of Portfolio V2.
 *
 * Mounted at a separate HTML entry point (index.v2.html → main.v2.tsx)
 * so the original V1 (src/main.tsx → src/App.tsx) is completely untouched.
 *
 * Uses HashRouter so the router reads the hash fragment (#/, #/projects, etc.)
 * rather than the real pathname. This prevents the 404 that occurs when
 * BrowserRouter tries to match "/index.v2.html" against declared routes.
 *
 * Migration path: when V2 is promoted to replace V1, swap HashRouter for
 * BrowserRouter with basename="/" and update the server/Vite config to
 * serve index.v2.html as the SPA fallback.
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
  )
}
