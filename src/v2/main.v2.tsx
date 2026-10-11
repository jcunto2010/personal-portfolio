import React from 'react'
import ReactDOM from 'react-dom/client'
import AppV2 from './AppV2'
import './tailwind.css'

/**
 * Canonical app entry — mounted from index.html.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppV2 />
  </React.StrictMode>,
)
