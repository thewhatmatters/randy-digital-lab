'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useTheme } from 'next-themes'
import { GridOverlay } from './grid-overlay'

/* Shared state for the site's persistent controls. Lives here so a keyboard
   shortcut and a clickable command-bar chip drive the same action, and so
   controls (grid overlay, light/dark/auto theme) share one home. */
type UIControls = {
  gridOn: boolean
  toggleGrid: () => void
  theme: string | undefined
  cycleTheme: () => void
  mounted: boolean
}

const Ctx = createContext<UIControls | null>(null)

export function useUIControls() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUIControls must be used within <UIChrome>')
  return ctx
}

// system → light → dark → system
const THEME_ORDER = ['system', 'light', 'dark'] as const

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return (
    !!el &&
    (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)
  )
}

/**
 * Client chrome wrapper: owns the controls state, binds the global keyboard
 * shortcuts (`g` grid, `t` theme), and renders the fixed-position overlay +
 * command bar alongside the (server-rendered) page passed as children. Must sit
 * inside next-themes' <ThemeProvider>.
 */
export function UIChrome({ children }: { children: React.ReactNode }) {
  const [gridOn, setGridOn] = useState(false)
  const toggleGrid = useCallback(() => setGridOn((v) => !v), [])

  const { theme, setTheme } = useTheme()
  // theme is unknown until mounted (server can't read the client preference);
  // gate UI on this to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const cycleTheme = useCallback(() => {
    const i = THEME_ORDER.indexOf((theme ?? 'system') as (typeof THEME_ORDER)[number])
    setTheme(THEME_ORDER[(i + 1) % THEME_ORDER.length])
  }, [theme, setTheme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      // never hijack while typing or as part of a chord
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        toggleGrid()
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        cycleTheme()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleGrid, cycleTheme])

  return (
    <Ctx.Provider value={{ gridOn, toggleGrid, theme, cycleTheme, mounted }}>
      {children}
      <GridOverlay on={gridOn} />
      <CommandBar />
    </Ctx.Provider>
  )
}

// All labels are 4 chars so the chip width never jumps as you cycle.
// "lite" stylizes "light"; system → "auto".
const MODE_LABEL: Record<string, string> = {
  system: 'auto',
  light: 'lite',
  dark: 'dark',
}

function CommandBar() {
  const { gridOn, toggleGrid, theme, cycleTheme, mounted } = useUIControls()

  const mode = mounted ? theme ?? 'system' : 'system'
  const themeLabel = MODE_LABEL[mode] ?? 'auto'
  // accent the chip once the user overrides the system default
  const themeActive = mounted && mode !== 'system'

  return (
    <div className="cmdbar" aria-label="Site controls">
      <button
        type="button"
        className="cmd-chip"
        data-chip="grid"
        data-active={gridOn}
        aria-pressed={gridOn}
        title="Toggle layout grid (g)"
        onClick={toggleGrid}
      >
        <kbd className="cmd-key">G</kbd>
        <span className="cmd-label">grid</span>
      </button>
      <button
        type="button"
        className="cmd-chip"
        data-chip="theme"
        data-active={themeActive}
        title={`Theme: ${themeLabel} — click to cycle (t)`}
        onClick={cycleTheme}
      >
        <kbd className="cmd-key">T</kbd>
        <span className="cmd-label">{themeLabel}</span>
      </button>
    </div>
  )
}
