'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { AURORA_BARS } from './aurora-bars'
import { WORK_TILE_ATTR } from './work-morph'
import styles from './aurora-sweep.module.scss'

// Aurora route transition — glimm.dev's mechanic (intercept the click, play a
// band, swap underneath it) with our own gesture: the footer bloom's
// equalizer, stood up across the viewport instead of at the end of the page.
// Same tokens, same arc, same skin as footer-reveal.tsx — see aurora-bars.ts
// and _aurora.scss, which both surfaces share so they cannot drift.
//
// Why an interceptor and not the View Transitions API: a fixed DOM band is
// captured INTO the root snapshot during a view transition, so it freezes
// exactly when it should be moving. Giving it its own view-transition-name
// buys a group we could transform, but the band must then be permanently
// rendered to have a snapshot at all. Intercepting the click and owning both
// halves — the band and the moment of the push — is simpler and leaves the
// timing tunable in one place (the three constants below).
//
// It stays translucent, so the swap is softened rather than hidden: it happens
// at PUSH_AT, when the light is at its densest. An opaque version could hide
// the swap outright, but covering the screen for ~300ms read as a page-load,
// not a transition.
//
// Reduced motion: the component renders nothing and never intercepts — links
// navigate normally, which is the honest reduced-motion answer for an effect
// that IS motion (same contract as the glow seat and the preloader).

/** Which gesture plays. 'rise' is the footer bloom standing up across the
 *  viewport and travelling off the top; 'sweep' is the earlier horizontal
 *  band crossing left to right (glimm's own shape), kept as the comparison. */
const GESTURE: 'rise' | 'sweep' = 'rise'

/** Total run, end to end. The rise needs longer than the sweep: it is two
 *  moves (grow, then travel out) where the sweep is one. */
const SWEEP_MS = GESTURE === 'rise' ? 760 : 620
/** Point in the run where the light is densest — the swap. For the rise that
 *  is the top of the growth, just before the panel starts travelling. */
const PUSH_AT = GESTURE === 'rise' ? 0.55 : 0.4
/** Nav order, so the sweep travels the way the eye does: going 01 → 03 sweeps
 *  forward, 03 → 01 sweeps back. Anything off this list sweeps forward.
 *  ('rise' has one direction — the aurora always comes up from the floor.) */
const NAV_ORDER = ['/', '/work', '/lab', '/notes']

type Direction = 'forward' | 'back'

/** The nav rank of a path — its section, so /notes/some-post ranks as /notes. */
function rank(pathname: string): number {
  const i = NAV_ORDER.findIndex(
    (p) => p !== '/' && (pathname === p || pathname.startsWith(`${p}/`))
  )
  return i === -1 ? (pathname === '/' ? 0 : NAV_ORDER.length) : i
}

/**
 * Should this click become a sweep? Everything that is not a plain left-click
 * onto another route on this site is left completely alone — modified clicks
 * (new tab), downloads, external hosts, hash links, the current page, and the
 * two opted-out families below.
 */
function sweepTarget(e: MouseEvent): string | null {
  if (e.defaultPrevented || e.button !== 0) return null
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null

  const anchor = (e.target as Element | null)?.closest?.('a')
  if (!(anchor instanceof HTMLAnchorElement)) return null
  if (anchor.target && anchor.target !== '_self') return null
  if (anchor.hasAttribute('download')) return null
  if (anchor.origin !== window.location.origin) return null

  // Opt-outs. The work tiles own their own transition (the tile→modal morph
  // measures the tile and grows it — a band over the top would be two
  // transitions arguing), and data-no-sweep is the escape hatch for anything
  // else that needs to stay unswept. The tile selector is built from the
  // morph's own constant, never hand-typed (tests/work-morph.test.ts).
  if (anchor.closest(`[${WORK_TILE_ATTR}], [data-no-sweep]`)) return null

  const href = anchor.pathname + anchor.search
  if (anchor.pathname === window.location.pathname) return null
  return href
}

export function AuroraSweep() {
  const router = useRouter()
  const pathname = usePathname()
  const [direction, setDirection] = useState<Direction | null>(null)
  const running = useRef(false)
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onClick = (e: MouseEvent) => {
      const href = sweepTarget(e)
      if (!href) return
      // One sweep at a time — a second click mid-run would restart the band
      // under itself. Swallow the click instead (the run is under a second).
      e.preventDefault()
      e.stopPropagation()
      if (running.current) return

      running.current = true
      setDirection(rank(href) >= rank(window.location.pathname) ? 'forward' : 'back')

      timers.current.push(
        window.setTimeout(() => router.push(href), SWEEP_MS * PUSH_AT)
      )
      timers.current.push(
        window.setTimeout(() => {
          running.current = false
          setDirection(null)
        }, SWEEP_MS)
      )
    }

    // Capture phase, on the document: this runs before React's root listener,
    // so stopPropagation keeps next-view-transitions' Link from also pushing
    // (its crossfade would be a second transition under the band).
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      clearTimers()
    }
  }, [router, clearTimers])

  // A back/forward button (or any nav we did not start) should not leave a
  // half-run band parked on screen.
  useEffect(() => {
    if (!running.current) {
      clearTimers()
      setDirection(null)
    }
  }, [pathname, clearTimers])

  if (!direction) return null

  const duration = { ['--sweep-ms' as string]: `${SWEEP_MS}ms` }

  return (
    <div className={styles.veil} aria-hidden="true">
      {GESTURE === 'rise' ? (
        // The bloom's own markup: one bar per grid column, each at its arc
        // height, growing from the bottom edge. The panel then carries them
        // off the top.
        <div className={styles.riser} style={duration}>
          {AURORA_BARS.map((h, i) => (
            <span
              key={i}
              className={styles.riserBar}
              style={{ ...duration, ['--bar-h' as string]: `${h}%` }}
            />
          ))}
        </div>
      ) : (
        <div
          className={`${styles.band} ${styles[direction]}`}
          style={duration}
        >
          {/* Eleven solid steps under one blur — the same construction laid on
              its side. */}
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i} className={styles.step} />
          ))}
        </div>
      )}
    </div>
  )
}
