'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { AuroraRiser, RISE_MS, RISE_PUSH_AT } from './aurora-riser'
import { WORK_TILE_ATTR } from './work-morph'
import styles from './aurora-sweep.module.scss'

// Aurora route transition — glimm.dev's mechanic (intercept the click, play a
// band, swap underneath it) with our own gesture: the footer bloom's
// equalizer, stood up across the viewport instead of at the end of the page.
// Same tokens, same arc, same skin as footer-reveal.tsx — see aurora-bars.ts
// and _aurora.scss, which both surfaces share so they cannot drift.
//
// This file is the ROUTE seat: it owns the click interception, the moment of
// the push, and the fixed veil the gesture plays in. The gesture itself is
// aurora-riser.tsx, shared with lab experiment 02 (aurora-transition.tsx), so
// the live demo in the lab is the same riser and not a lookalike.
//
// Why an interceptor and not the View Transitions API: a fixed DOM band is
// captured INTO the root snapshot during a view transition, so it freezes
// exactly when it should be moving. Giving it its own view-transition-name
// buys a group we could transform, but the band must then be permanently
// rendered to have a snapshot at all. Intercepting the click and owning both
// halves — the band and the moment of the push — is simpler and leaves the
// timing tunable in one place (the riser's two constants).
//
// It stays translucent, so the swap is softened rather than hidden: it happens
// at PUSH_AT, when the light is at its densest.
//
// Reduced motion: the component renders nothing and never intercepts — links
// navigate normally, which is the honest reduced-motion answer for an effect
// that IS motion (same contract as the glow seat and the preloader).

/** Total run, end to end, and the point in it where the route swaps. Both are
 *  the riser's own numbers (its keyframes bake them in) — named here because
 *  this seat is what schedules against them. */
const SWEEP_MS = RISE_MS
const PUSH_AT = RISE_PUSH_AT

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
  const [playing, setPlaying] = useState(false)
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
      setPlaying(true)

      timers.current.push(
        window.setTimeout(() => router.push(href), SWEEP_MS * PUSH_AT)
      )
      timers.current.push(
        window.setTimeout(() => {
          running.current = false
          setPlaying(false)
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
      setPlaying(false)
    }
  }, [pathname, clearTimers])

  if (!playing) return null

  return (
    <div className={styles.veil} aria-hidden="true">
      <AuroraRiser ms={SWEEP_MS} />
    </div>
  )
}
