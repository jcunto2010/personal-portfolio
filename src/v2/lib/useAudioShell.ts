/**
 * useAudioShell — Phase 3 (with audio diagnostics)
 *
 * Manages a single background audio track (shona-theme.mp3) using the
 * native HTMLAudioElement API.
 *
 * KEY GUARANTEE: The MP3 is NOT fetched until the user explicitly calls
 * `play()` for the first time. The `<audio>` element is created lazily
 * inside `play()`, so no network request is made at import time, at hook
 * mount time, or when audioEnabled === false.
 *
 * Phase 3 additions:
 *   - AudioDiagnostics object exposed for the debug HUD.
 *   - play() captures the Promise result and stores it in diagnostics.
 *   - All errors are stored (not silently swallowed).
 *   - Audio state machine: idle → loading → ready | error → playing
 */

import { useCallback, useEffect, useRef, useState } from 'react'

const AUDIO_SRC = '/assets/audio/shona-theme.mp3'
const DEFAULT_VOLUME = 0.4

export type AudioState = 'idle' | 'loading' | 'ready' | 'playing' | 'error'

export interface AudioDiagnostics {
  /** true once HTMLAudioElement has been created */
  elementCreated: boolean
  /** true once audio.src has been assigned */
  srcAssigned: boolean
  /** true while play() has been called and resolved */
  playAttempted: boolean
  /** result of the last play() Promise: 'resolved' | 'rejected' | 'pending' | null */
  playResult: 'resolved' | 'rejected' | 'pending' | null
  /** last error message from play() rejection or media error */
  lastError: string | null
  /** audio.duration once metadata loaded, -1 if not yet */
  duration: number
  /** current state machine value */
  audioState: AudioState
}

export interface AudioShell {
  play: () => void
  pause: () => void
  stop: () => void
  setVolume: (v: number) => void
  isPlaying: boolean
  isReady: boolean
  diagnostics: AudioDiagnostics
}

const INITIAL_DIAGNOSTICS: AudioDiagnostics = {
  elementCreated: false,
  srcAssigned: false,
  playAttempted: false,
  playResult: null,
  lastError: null,
  duration: -1,
  audioState: 'idle',
}

export function useAudioShell(): AudioShell {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [diagnostics, setDiagnostics] = useState<AudioDiagnostics>(INITIAL_DIAGNOSTICS)

  const patchDiag = useCallback((patch: Partial<AudioDiagnostics>) => {
    setDiagnostics((prev) => ({ ...prev, ...patch }))
  }, [])

  /**
   * Lazily initialise the audio element.
   * Called only on the first play() — this is the single point where the
   * browser makes a network request for the MP3.
   */
  const getOrCreate = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current

    const audio = new Audio()
    audio.loop = true
    audio.volume = DEFAULT_VOLUME
    audio.preload = 'none'

    patchDiag({ elementCreated: true, audioState: 'loading' })

    audio.addEventListener('canplaythrough', () => {
      setIsReady(true)
      patchDiag({ audioState: 'ready', duration: audio.duration })
    }, { once: true })

    audio.addEventListener('loadedmetadata', () => {
      patchDiag({ duration: audio.duration })
    })

    audio.addEventListener('play', () => {
      setIsPlaying(true)
      patchDiag({ audioState: 'playing' })
    })

    audio.addEventListener('pause', () => {
      setIsPlaying(false)
      setDiagnostics((prev) => ({
        ...prev,
        audioState: prev.audioState === 'playing' ? 'ready' : prev.audioState,
      }))
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
    })

    audio.addEventListener('error', () => {
      const code = audio.error?.code ?? -1
      const msg = audio.error?.message ?? 'unknown media error'
      patchDiag({
        lastError: `MediaError code=${code}: ${msg}`,
        audioState: 'error',
      })
      setIsPlaying(false)
    })

    // Setting src triggers the actual fetch.
    audio.src = AUDIO_SRC
    patchDiag({ srcAssigned: true })

    audioRef.current = audio
    return audio
  }, [patchDiag])

  const play = useCallback(() => {
    const audio = getOrCreate()
    patchDiag({ playAttempted: true, playResult: 'pending' })

    audio.play().then(() => {
      patchDiag({ playResult: 'resolved' })
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      patchDiag({
        playResult: 'rejected',
        lastError: `play() rejected: ${msg}`,
        audioState: 'error',
      })
    })
  }, [getOrCreate, patchDiag])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
  }, [])

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, v))
    }
  }, [])

  // Cleanup on unmount — pause and discard element.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [])

  return { play, pause, stop, setVolume, isPlaying, isReady, diagnostics }
}
