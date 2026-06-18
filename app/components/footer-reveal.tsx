'use client'

import { useEffect, useRef } from 'react'

import styles from './footer-reveal.module.scss'

// Per-column bar heights (% of the reveal area) — a symmetric arc that peaks
// at the center columns and tapers to the edges (a raised half-sine). The whole
// arc scales with scroll velocity via --p, so harder pushes make it taller and
// the middle column reaches the peak.
const BARS = [39, 57, 73, 86, 95, 99, 99, 95, 86, 73, 57, 39]

/**
 * Footer aurora "equalizer" — the sui.io / diabrowser.com "push past the
 * footer" reveal, zero-dependency, rendered as grid-aligned gradient bars.
 *
 * The page scrolls normally — you reach and rest at the footer's bottom edge.
 * Only when you're at the bottom and keep pushing does this engage: it lifts
 * the page up by a transform (no scroll distance), uncovering a fixed panel of
 * accent gradient bars pinned behind it — one per grid column, with dotted
 * column guides — and carries the footer's "© <year>" up with it.
 *
 * Feel: VELOCITY-DRIVEN — the lift maps to smoothed scroll speed and ratchets
 * up to the peak (harder push → bars rise higher); HOLD at the top — when input
 * stops it dwells at the peak for HOLD_MS before the spring releases it. The
 * bars themselves scale up via the JS-set `--p` (0→1). Honors
 * prefers-reduced-motion (effect disabled; footer is just a normal footer).
 * <main> carries an opaque background so the bars only show in the gap the lift
 * opens.
 */
export function FooterReveal() {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    const main = document.querySelector('main') as HTMLElement | null
    if (!panel || !main) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const sc = document.scrollingElement || document.documentElement
    // Full lift == the panel's own height, so at peak velocity the gap exactly
    // reveals the panel and the center bar (≈99%) reaches the top.
    let MAX = panel.offsetHeight || 340
    const measureMax = () => {
      MAX = panel.offsetHeight || 340
    }
    const GAIN = 2.6 // smoothed velocity → target lift
    const HOLD_MS = 260 // dwell at the peak before snapping back
    const IDLE_MS = 90 // input gap that ends the pull

    let lift = 0
    let vel = 0
    let lastInput = 0
    let holdUntil = 0
    let phase: 'idle' | 'pull' | 'hold' | 'release' = 'idle'
    let raf = 0
    let running = false

    const atBottom = () =>
      sc.scrollHeight - sc.scrollTop - sc.clientHeight <= 2

    const apply = () => {
      const p = Math.max(0, Math.min(1, lift / MAX))
      main.style.transform = lift > 0.1 ? `translate3d(0, ${-lift}px, 0)` : ''
      panel.style.setProperty('--p', String(p))
      panel.style.opacity = lift > 0.1 ? String(Math.min(1, p * 1.3)) : ''
    }

    const reset = () => {
      lift = 0
      vel = 0
      running = false
      phase = 'idle'
      main.style.transform = ''
      panel.style.opacity = ''
      panel.style.setProperty('--p', '0')
    }

    const frame = (ts: number) => {
      if (phase === 'pull') {
        const want = Math.min(MAX, vel * GAIN)
        if (want > lift) lift += (want - lift) * 0.3 // ratchet up to the peak
        if (ts - lastInput > IDLE_MS) {
          phase = 'hold'
          holdUntil = ts + HOLD_MS
        }
      } else if (phase === 'hold') {
        if (ts >= holdUntil) phase = 'release'
      } else if (phase === 'release') {
        lift += (0 - lift) * 0.12
      }

      apply()

      if (phase === 'release' && lift < 0.4) {
        reset()
        return
      }
      raf = requestAnimationFrame(frame)
    }

    const kick = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(frame)
      }
    }

    const normalize = (e: WheelEvent) => {
      if (e.deltaMode === 1) return e.deltaY * 16
      if (e.deltaMode === 2) return e.deltaY * window.innerHeight
      return e.deltaY
    }

    const feed = (d: number) => {
      vel = vel * 0.6 + d * 0.4
      lastInput = performance.now()
      phase = 'pull'
      kick()
    }

    const onWheel = (e: WheelEvent) => {
      if (!atBottom()) return
      const d = normalize(e)
      if (d > 0) feed(d)
    }

    let touchY = 0
    let touchT = 0
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0
      touchT = performance.now()
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY
      const now = performance.now()
      const dy = touchY - y
      const dt = Math.max(16, now - touchT)
      touchY = y
      touchT = now
      if (dy > 0 && atBottom()) feed((dy / dt) * 16)
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('resize', measureMax)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize', measureMax)
      cancelAnimationFrame(raf)
      main.style.transform = ''
    }
  }, [])

  return (
    <div className={styles.bloom} aria-hidden="true">
      {/* panel mirrors grid-page: centered, max-width 72rem, 12 columns — so the
          bars land on the grid columns with dotted guides between them */}
      <div className={styles.panel} ref={panelRef}>
        {BARS.map((h, i) => (
          <div className={styles.col} key={i}>
            <div
              className={styles.bar}
              style={{ ['--bar-h' as string]: `${h}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
