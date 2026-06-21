'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeCtx {
  theme: Theme
  toggle: () => void
}

const DARK_VARS = {
  '--gold': '#f0b429',
  '--gold-dark': '#c8860a',
  '--bg': '#0a0a0f',
  '--surface': '#14141e',
  '--surface2': '#1e1e2e',
  '--border': '#2a2a3e',
  '--text': '#e8e8f0',
  '--text-muted': '#888898',
  '--input-bg': '#1e1e2e',
  '--scrollbar': '#2a2a3e',
} as const

const LIGHT_VARS = {
  '--gold': '#c8860a',
  '--gold-dark': '#a06808',
  '--bg': '#f0f2f7',
  '--surface': '#ffffff',
  '--surface2': '#e8eaf2',
  '--border': '#d0d3e0',
  '--text': '#1a1a2e',
  '--text-muted': '#60607a',
  '--input-bg': '#f5f6fc',
  '--scrollbar': '#c8cad8',
} as const

function applyTheme(theme: Theme) {
  const vars = theme === 'light' ? LIGHT_VARS : DARK_VARS
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
  root.setAttribute('data-theme', theme)
}

const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = (localStorage.getItem('pm-theme') as Theme) ?? 'dark'
    setTheme(saved)
    applyTheme(saved)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('pm-theme', next)
    applyTheme(next)
  }

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}

export function useTheme() {
  return useContext(Ctx)
}
