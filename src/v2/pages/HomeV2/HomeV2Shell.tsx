/**
 * HomeV2Shell — Phase 3 orchestrator
 *
 * Composes the full V2 home experience:
 *
 *   ┌─ AppModeProvider (localStorage persistence) ──────────────┐
 *   │  ┌─ EntryGate (shown on first visit or after reset) ─────┐ │
 *   │  │  Mode: immersive | non-immersive                       │ │
 *   │  │  Audio: on | off                                       │ │
 *   │  │  Fullscreen: recommended for immersive                 │ │
 *   │  └────────────────────────────────────────────────────────┘ │
 *   │                                                              │
 *   │  After "Enter" →                                            │
 *   │  ┌─ mode === 'non-immersive' ──────────────────────────┐   │
 *   │  │  NonImmersiveHome → HomeV2 editorial                │   │
 *   │  └────────────────────────────────────────────────────┘   │
 *   │  ┌─ mode === 'immersive' ──────────────────────────────┐   │
 *   │  │  ImmersiveErrorBoundary (shows crash message)       │   │
 *   │  │    Suspense (dark fallback while chunk loads)       │   │
 *   │  │      LazySolarScene (R3F / WebGL)                   │   │
 *   │  └────────────────────────────────────────────────────┘   │
 *   │                                                              │
 *   │  Audio shell (useAudioShell) — plays shona-theme.mp3        │
 *   │  only if audioEnabled === true AND user has entered.         │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Phase 3 additions:
 *   - ImmersiveErrorBoundary: catches WebGL/R3F crashes and shows a
 *     visible error screen instead of a blank navy page.
 *   - audio.diagnostics threaded into LazySolarScene for debug HUD.
 *   - mode and entered state passed to LazySolarScene for debug HUD.
 *
 * AUDIO LAZY-LOAD CONTRACT:
 *   The HTMLAudioElement is created inside useAudioShell.play() on the
 *   first call. play() is only called when:
 *     (a) audioEnabled is true in context, AND
 *     (b) the user has dismissed the Entry Gate (entered === true).
 *
 * WEBGL ISOLATION CONTRACT:
 *   SolarScene (and its GLB preloads) is only imported via React.lazy so
 *   the WebGL bundle is never included in the non-immersive code path.
 *
 * [NV] Phase 4: add audio controls HUD (volume slider, mute button).
 */

import { Component, lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AppModeProvider, useAppMode } from '../../lib/appModeContext'
import { useAudioShell } from '../../lib/useAudioShell'
import { EntryGate } from '../../components/EntryGate/EntryGate'
import { NonImmersiveHome } from '../../components/NonImmersiveHome/NonImmersiveHome'
import { SpaceLoadingScreen } from '../../components/SpaceLoadingScreen/SpaceLoadingScreen'
import HomeV2 from './HomeV2'
import { useJourneyLoader } from '../../lib/useJourneyLoader'

// ── Lazy SolarScene — WebGL bundle only loaded in immersive mode ───────────────

const LazySolarScene = lazy(() =>
  import('../../solar/SolarScene').then((mod) => ({ default: mod.SolarScene })),
)

// ── ImmersiveErrorBoundary ────────────────────────────────────────────────────
// Catches any unhandled error from the SolarScene/R3F tree and renders a
// visible error screen instead of a blank navy page. This makes crashes
// diagnosable without opening DevTools.

interface ImmersiveErrorBoundaryState {
  error: Error | null
}

interface ImmersiveErrorBoundaryProps {
  children: ReactNode
  onReset: () => void
}

class ImmersiveErrorBoundary extends Component<
  ImmersiveErrorBoundaryProps,
  ImmersiveErrorBoundaryState
> {
  constructor(props: ImmersiveErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ImmersiveErrorBoundaryState {
    return { error }
  }

  componentDidCatch() {}

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0a1a',
        color: '#f87171',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        zIndex: 9999,
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fca5a5' }}>
          ⚠ IMMERSIVE MODE CRASHED
        </div>
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: '0.5rem',
          padding: '1rem 1.5rem',
          maxWidth: '600px',
          fontSize: '12px',
          lineHeight: '1.7',
          wordBreak: 'break-word',
        }}>
          <div style={{ color: '#fca5a5', marginBottom: '0.5rem' }}>
            {error.name}: {error.message}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '11px', whiteSpace: 'pre-wrap' }}>
            {error.stack?.slice(0, 800)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={this.props.onReset}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              fontFamily: 'monospace',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            ← Back to Entry Gate
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(239,68,68,0.4)',
              background: 'rgba(239,68,68,0.1)',
              color: '#fca5a5',
              fontFamily: 'monospace',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            ↺ Reload page
          </button>
        </div>
        <div style={{ color: '#475569', fontSize: '11px' }}>
          Open DevTools → Console for full stack trace.
        </div>
      </div>
    )
  }
}

// ── Inner shell (needs AppModeContext in scope) ────────────────────────────

function HomeV2Inner() {
  const { mode, audioEnabled } = useAppMode()
  const audio = useAudioShell()

  type EntryPhase = 'select' | 'loading' | 'ready'
  const [entryPhase, setEntryPhase] = useState<EntryPhase>('select')
  const [immersiveSceneReady, setImmersiveSceneReady] = useState(false)
  const [hasEnteredOnce, setHasEnteredOnce] = useState(false)

  const journeyLoader = useJourneyLoader(mode)

  // Orquesta la transición select → loading → ready
  useEffect(() => {
    if (entryPhase === 'loading') {
      journeyLoader.start()
    }
    if (entryPhase === 'select') {
      journeyLoader.reset()
    }
  }, [entryPhase, journeyLoader])

  useEffect(() => {
    if (entryPhase === 'loading' && journeyLoader.status === 'ready') {
      setEntryPhase('ready')
    }
  }, [entryPhase, journeyLoader.status])

  // Start / stop audio in response to audioEnabled + entered state.
  useEffect(() => {
    // Audio solo debe sonar en "immersive" (modo inmersivo).
    // En "non-immersive" (modo clásico) forzamos stop para evitar música.
    if (entryPhase === 'ready' && audioEnabled && mode === 'immersive') {
      audio.play()
    } else {
      audio.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryPhase, audioEnabled, mode])

  // Stop audio when unmounting (navigation away from Home).
  useEffect(() => {
    return () => { audio.stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleEnter() {
    setHasEnteredOnce(true)
    setEntryPhase('loading')
  }

  function handleSwitchMode() {
    audio.stop()
    setEntryPhase('select')
    setImmersiveSceneReady(false)
    journeyLoader.reset()
  }

  // Reset immersive scene ready when entering loading so overlay shows until onReady.
  useEffect(() => {
    if (entryPhase === 'loading' && mode === 'immersive') {
      setImmersiveSceneReady(false)
    }
  }, [entryPhase, mode])

  return (
    <>
      {entryPhase === 'select' && (
        <EntryGate onEnter={handleEnter} skipAnimations={hasEnteredOnce} />
      )}

      {entryPhase === 'loading' && mode === 'immersive' && (
        <>
          <SpaceLoadingScreen />
          {journeyLoader.status === 'error' && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                padding: '2rem',
                background: 'rgba(0,0,0,0.85)',
              }}
              role="alert"
            >
              <p style={{ color: '#fecaca', fontFamily: 'monospace', fontSize: '0.9rem', margin: 0 }}>
                {journeyLoader.error}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEntryPhase('select')
                  journeyLoader.reset()
                }}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(248,250,252,0.3)',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ← Volver a la selección
              </button>
            </div>
          )}
        </>
      )}

      {entryPhase === 'loading' && mode === 'non-immersive' && (
        <>
          <SpaceLoadingScreen />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              pointerEvents: 'none',
              padding: '2rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setEntryPhase('select')
                journeyLoader.reset()
              }}
              style={{
                pointerEvents: 'auto',
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                border: '1px solid rgba(248,250,252,0.3)',
                background: 'rgba(255,255,255,0.08)',
                color: '#e2e8f0',
                fontFamily: 'monospace',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              ← Volver a la selección
            </button>
          </div>
        </>
      )}

      {entryPhase === 'ready' && mode === 'non-immersive' && (
        <NonImmersiveHome onSwitchMode={handleSwitchMode}>
          <HomeV2 />
        </NonImmersiveHome>
      )}

      {entryPhase === 'ready' && mode === 'immersive' && (
        <>
          <ImmersiveErrorBoundary onReset={handleSwitchMode}>
            <Suspense fallback={<SpaceLoadingScreen />}>
              <LazySolarScene
                onSwitchMode={handleSwitchMode}
                mode={mode}
                entered={entryPhase === 'ready'}
                audioEnabled={audioEnabled}
                audioDiagnostics={audio.diagnostics}
                onReady={() => setImmersiveSceneReady(true)}
              />
            </Suspense>
          </ImmersiveErrorBoundary>
          {!immersiveSceneReady && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                pointerEvents: 'auto',
              }}
              aria-hidden="true"
            >
              <SpaceLoadingScreen />
            </div>
          )}
        </>
      )}
    </>
  )
}

// ── Default export (with provider) ────────────────────────────────────────

export default function HomeV2Shell() {
  return (
    <AppModeProvider>
      <HomeV2Inner />
    </AppModeProvider>
  )
}
