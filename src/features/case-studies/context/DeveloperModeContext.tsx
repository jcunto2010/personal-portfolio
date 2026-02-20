import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface DeveloperModeContextValue {
  developerMode: boolean
  setDeveloperMode: (value: boolean) => void
}

const DeveloperModeContext = createContext<DeveloperModeContextValue | null>(null)

export function DeveloperModeProvider({ children }: { children: React.ReactNode }) {
  const [developerMode, setDeveloperModeState] = useState(false)

  const setDeveloperMode = useCallback((value: boolean) => {
    setDeveloperModeState(value)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.developerMode = developerMode ? 'true' : 'false'
  }, [developerMode])

  return (
    <DeveloperModeContext.Provider value={{ developerMode, setDeveloperMode }}>
      {children}
    </DeveloperModeContext.Provider>
  )
}

export function useDeveloperMode(): DeveloperModeContextValue {
  const ctx = useContext(DeveloperModeContext)
  if (!ctx) {
    throw new Error('useDeveloperMode must be used within DeveloperModeProvider')
  }
  return ctx
}
