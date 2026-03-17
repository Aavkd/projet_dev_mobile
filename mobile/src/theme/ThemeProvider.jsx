import { createContext, useContext, useMemo } from 'react'
import { theme as baseTheme } from './tokens'

const ThemeContext = createContext(baseTheme)

export function ThemeProvider({ children }) {
  const value = useMemo(() => baseTheme, [])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
