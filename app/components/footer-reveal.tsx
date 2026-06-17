'use client'

import { useEffect, useRef } from 'react'

/**
 * Footer "aurora curtain" — the diabrowser.com / sui.io overscroll reveal,
 * zero-dependency.
 *
 * The aurora is a REAL in-flow section below the footer, so it adds genuine
 * scroll height (the scrollbar travels into it). At the rest position the
 * section sits exactly one viewport below the footer — fully hidden, like a
 * curtain. Scrolling "past" the footer pulls the curtain up into view; when you
 * stop, the scroll position springs back up to the footer, re-hiding it.
 *
 *   restTop ───────────────  footer at viewport bottom, curtain hidden (rest)
 *      │  ▲ overscroll travel = section height (--reveal-h)
 *   maxScroll ─────────────  full aurora visible (never a resting spot)
 *
 * Honors prefers-reduced-motion: the spring is disabled, so the section just
 * becomes a static gradient you can scroll to (no scroll-jacking).
 * Drives scrollTop via rAF only — no layout-affecting animation.
 */
export function FooterReveal() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const sc = document.scrollingElement || document.documentElement

    // Rest position: the section's top sits at the viewport bottom (curtain
    // hidden). maxScroll shows the whole section; the gap between them is the
    // section's own height — the overscroll travel.
    const restTop = () =>
      sc.scrollHeight - window.innerHeight - section.offsetHeight

    let snapping = false
    let idle = 0
    let raf = 0

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const springBack = (to: number) => {
      const from = sc.scrollTop
      const dist = to - from
      if (dist >= -0.5) {
        snapping = false
        return
      }
      snapping = true
      const dur = 460
      let start = 0
      const step = (ts: number) => {
        if (!start) start = ts
        const t = Math.min(1, (ts - start) / dur)
        sc.scrollTop = from + dist * easeOutCubic(t)
        if (t < 1) {
          raf = requestAnimationFrame(step)
        } else {
          snapping = false
        }
      }
      raf = requestAnimationFrame(step)
    }

    const onScroll = () => {
      if (snapping) return
      const rest = restTop()
      if (rest < -1) return // no curtain room (shouldn't happen given min-h)
      if (sc.scrollTop <= rest) return // at/above rest — not in the reveal zone
      // In the curtain. Wait for scrolling (incl. trackpad momentum) to settle,
      // then spring the scroll position back up to the footer.
      window.clearTimeout(idle)
      idle = window.setTimeout(() => springBack(rest), 120)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(idle)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="footer-reveal" ref={sectionRef} aria-hidden="true">
      <div className="footer-reveal__aurora" />
    </div>
  )
}
