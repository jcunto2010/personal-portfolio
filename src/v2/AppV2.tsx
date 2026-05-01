import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import {
  LazyHomeV2,
  LazyProjectsV2,
  LazyProjectDetailV2,
  LazyClassicModePage,
  PageFallback,
} from './router/routes'
import './tokens/tokens.css'
import { LocaleProvider } from './lib/localeContext'

/**
 * AppV2 — root of Portfolio V2.
 *
 * V2 is the sole application entry point (mounted from index.html → main.v2.tsx).
 *
 * BrowserRouter with basename='/'. The server must redirect all paths to
 * index.html (SPA fallback) — configured in vercel.json and netlify.toml.
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
              path="classic-mode"
              element={
                <Suspense fallback={<PageFallback />}>
                  <LazyClassicModePage />
                </Suspense>
              }
            />
            <Route path="editorial-glowup" element={<Navigate to="/classic-mode" replace />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </LocaleProvider>
  )
}
