import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
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
 * Uses BrowserRouter with basename='/'. All routes are served from the root.
 * The server must redirect all paths to index.html — already configured in
 * vercel.json and netlify.toml.
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
      <BrowserRouter>
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
      </BrowserRouter>
    </LocaleProvider>
  )
}
