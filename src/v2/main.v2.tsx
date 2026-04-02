import React from 'react'
import ReactDOM from 'react-dom/client'
import AppV2 from './AppV2'
import { initTelemetry } from './lib/telemetry'

/**
 * Canonical app entry — mounted from index.html.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppV2 />
  </React.StrictMode>,
)

void initTelemetry().catch((err) => {
  console.error('[telemetry] initTelemetry failed', err)
})
