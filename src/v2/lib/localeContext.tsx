/**
 * LocaleContext — Phase 1
 *
 * Simple language toggle for V2:
 * - default: 'en'
 * - persisted to localStorage
 * - exposed via `useLocale()`
 *
 * We keep it intentionally lightweight (no i18n framework) so
 * we can translate specific editorial/WebGL copy progressively.
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

export type V2Locale = 'en' | 'es'

export interface LocaleState {
  locale: V2Locale
  setLocale: (locale: V2Locale) => void
}

const LS_LOCALE_KEY = 'v2:locale'

function readLocale(): V2Locale {
  try {
    const v = localStorage.getItem(LS_LOCALE_KEY)
    if (v === 'en' || v === 'es') return v
  } catch {
    // localStorage blocked (private mode, etc.)
  }
  return 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<V2Locale>(() => readLocale())

  // Defensive sync in case localStorage changes in another tab.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== LS_LOCALE_KEY) return
      if (e.newValue === 'en' || e.newValue === 'es') setLocaleState(e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setLocale = useCallback((next: V2Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(LS_LOCALE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<LocaleState>(() => ({ locale, setLocale }), [locale, setLocale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

const LocaleContext = createContext<LocaleState | null>(null)

export function useLocale(): LocaleState {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}

