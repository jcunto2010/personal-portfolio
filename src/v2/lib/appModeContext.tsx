/**
 * AppModeContext — Phase 1
 *
 * Manages two user preferences that are persisted to localStorage:
 *   - mode:  'immersive' | 'non-immersive'
 *   - audio: boolean (whether the user has opted-in to background audio)
 *
 * The audio flag controls ONLY whether the user has given consent to load
 * and play audio. The actual HTMLAudioElement is owned by useAudioShell.
 *
 * Both preferences are initialised from localStorage on first render so the
 * Entry Gate can show the previous choice as a default.
 *
 * Fullscreen is handled imperatively (not stored) because:
 *   - The Fullscreen API is inherently imperative and permission-gated.
 *   - We expose requestFullscreen / exitFullscreen helpers here so any
 *     component can trigger it without importing the raw API.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

export type AppMode = 'immersive' | 'non-immersive'

export interface AppModeState {
  mode: AppMode
  audioEnabled: boolean
  setMode: (mode: AppMode) => void
  setAudioEnabled: (enabled: boolean) => void
  /** Requests browser fullscreen on the document element. No-op if already full. */
  requestFullscreen: () => Promise<void>
  /** Exits fullscreen if active. */
  exitFullscreen: () => Promise<void>
  isFullscreen: boolean
}

// ── Storage helpers ───────────────────────────────────────────────────────────

const LS_MODE_KEY  = 'v2:appMode'
const LS_AUDIO_KEY = 'v2:audioEnabled'

function readMode(): AppMode {
  try {
    const v = localStorage.getItem(LS_MODE_KEY)
    if (v === 'immersive' || v === 'non-immersive') return v
  } catch {
    // localStorage blocked (private mode, etc.)
  }
  return 'non-immersive'
}

function readAudio(): boolean {
  try {
    return localStorage.getItem(LS_AUDIO_KEY) === 'true'
  } catch {
    return false
  }
}

function writeMode(mode: AppMode): void {
  try { localStorage.setItem(LS_MODE_KEY, mode) } catch { /* ignore */ }
}

function writeAudio(enabled: boolean): void {
  try { localStorage.setItem(LS_AUDIO_KEY, String(enabled)) } catch { /* ignore */ }
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppModeContext = createContext<AppModeState | null>(null)

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(readMode)
  const [audioEnabled, setAudioState] = useState<boolean>(readAudio)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    () => Boolean(document.fullscreenElement),
  )

  // Keep isFullscreen in sync with actual browser state.
  // The user can exit fullscreen via Escape / OS shortcuts without going
  // through our exitFullscreen() helper. Without this listener the flag
  // would stay stale (true) while the browser is no longer fullscreen,
  // causing the layout to not recover after the viewport resize.
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleChange)
    document.addEventListener('webkitfullscreenchange', handleChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleChange)
      document.removeEventListener('webkitfullscreenchange', handleChange)
    }
  }, [])

  const setMode = useCallback((next: AppMode) => {
    writeMode(next)
    setModeState(next)
  }, [])

  const setAudioEnabled = useCallback((enabled: boolean) => {
    writeAudio(enabled)
    setAudioState(enabled)
  }, [])

  const requestFullscreen = useCallback(async () => {
    if (document.fullscreenElement) return
    try {
      await document.documentElement.requestFullscreen()
      // State update is handled by the fullscreenchange event listener.
    } catch {
      // Browser denied or not supported — silent fail.
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) return
    try {
      await document.exitFullscreen()
      // State update is handled by the fullscreenchange event listener.
    } catch { /* ignore */ }
  }, [])

  const value = useMemo<AppModeState>(
    () => ({
      mode,
      audioEnabled,
      setMode,
      setAudioEnabled,
      requestFullscreen,
      exitFullscreen,
      isFullscreen,
    }),
    [mode, audioEnabled, setMode, setAudioEnabled, requestFullscreen, exitFullscreen, isFullscreen],
  )

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  )
}

/** Throws if used outside AppModeProvider — ensures wiring is explicit. */
export function useAppMode(): AppModeState {
  const ctx = useContext(AppModeContext)
  if (!ctx) throw new Error('useAppMode must be used inside <AppModeProvider>')
  return ctx
}
