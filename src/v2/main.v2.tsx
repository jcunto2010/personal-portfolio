import React from 'react'
import ReactDOM from 'react-dom/client'
import AppV2 from './AppV2'

/**
 * V2 entry point.
 * This mounts into the same #root element but from a separate HTML file
 * (index.v2.html), so the V1 entry point (src/main.tsx) is never touched.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppV2 />
  </React.StrictMode>,
)
