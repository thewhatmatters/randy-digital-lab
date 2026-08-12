'use client'

import { useEffect, useRef, useState } from 'react'
import { MeshGradient } from '@paper-design/shaders-react'

// The /work tile's glow ground — Paper's MeshGradient shader
// (@paper-design/shaders-react) seated as the media panel's background
// layer: a slow monochrome ink flow (their "Ink" preset recolored to the
// house tokens) showing through the work images' transparent margins, so
// the artwork floats on moving light.
//
// Monochrome by construction: the shader wants concrete color strings, so
// the palette is read from the tokens (--surface → --fg) at first wake —
// one theme-correct read, no hardcoded colors. The WebGL mount is deferred
// to that first wake too (a resting grid pays zero GPU contexts), and stays
// mounted after: the consumer's opacity fades it, and speed drops to 0 so
// an unhovered tile draws no frames. Reduced motion never mounts (the
// consumer's CSS also hides the layer).

export function WorkGlow({
  active,
  className,
}: {
  /** The tile's wake state (hover/focus) — animates only while true. */
  active: boolean
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [colors, setColors] = useState<string[] | null>(null)

  // Pure grayscale ramps, one per ground — deliberately DIFFERENT, not a
  // shared formula: dark mode runs blacks/dark-grays (--bg → --border;
  // anything muted-bright glared against the dark page); light mode packs
  // four LIGHT stops (--bg → --muted) so the field stays a whisper —
  // fg-dark ink would overpower a white page. (The shader leaves
  // near-black voids where no color spot reaches, so stop count doubles
  // as a brightness dial.) The ground is judged from the resolved --bg,
  // so any theme mechanism (media query or toggle) lands on the right
  // ramp.
  const readColors = (el: HTMLElement) => {
    const styles = getComputedStyle(el)
    const token = (name: string) => styles.getPropertyValue(name).trim()
    // NB: the CSS pipeline minifies hex tokens (#ffffff → #fff) — expand
    // before parsing, or light mode silently reads as dark.
    const raw = token('--bg').replace('#', '')
    const hex =
      raw.length === 3
        ? raw
            .split('')
            .map((c) => c + c)
            .join('')
        : raw
    const isLightGround =
      hex.length === 6 &&
      (parseInt(hex.slice(0, 2), 16) +
        parseInt(hex.slice(2, 4), 16) +
        parseInt(hex.slice(4, 6), 16)) /
        3 >
        127
    return isLightGround
      ? [token('--bg'), token('--surface'), token('--border'), token('--muted')]
      : [token('--bg'), token('--surface'), token('--border')]
  }
  // The flow keeps moving while the consumer's opacity fades out — pausing
  // at mouse-out would freeze the ink mid-fade. Mirrors the module's 1s
  // opacity transition.
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!active || colors) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return
    setColors(readColors(el))
  }, [active, colors])

  // Follow theme toggles after mount: next-themes swaps [data-theme] on
  // <html> (auto resolves to a concrete value there too), so watching that
  // one attribute re-reads the ramp exactly when the tokens change — a
  // mounted shader never keeps a stale palette.
  useEffect(() => {
    if (!colors) return
    const observer = new MutationObserver(() => {
      const el = ref.current
      if (el) setColors(readColors(el))
    })
    observer.observe(document.documentElement, {
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [colors])

  const FADE_MS = 1000
  useEffect(() => {
    if (active) {
      setRunning(true)
      return
    }
    const t = setTimeout(() => setRunning(false), FADE_MS)
    return () => clearTimeout(t)
  }, [active])

  return (
    <span ref={ref} className={className} aria-hidden="true">
      {colors && (
        <MeshGradient
          style={{ width: '100%', height: '100%' }}
          colors={colors}
          speed={running ? 0.6 : 0}
          distortion={1}
          swirl={0.2}
        />
      )}
    </span>
  )
}
