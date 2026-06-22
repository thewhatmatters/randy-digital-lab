'use client'

import { useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { POOL, triadForPath } from './reel-glyphs'
import styles from './preloader.module.scss'

// Page-load intro veil: a 3×3 slot machine. Three reels are closed DRUMS — a true
// 12-sided cylinder, one pool glyph per face, 30° apart (12×30 = 360°). Each drum
// spins several full turns and clacks to a stop left-to-right; the CENTER row is the
// result triad — DETERMINISTIC per route (see reel-glyphs) so it reads as a per-page
// signature — with neighbour glyphs tilting away above and below on the drum. Then
// the page comes into FOCUS: an opaque cover fades while a backdrop blur on the veil
// resolves from soft to sharp. Fires `preloader:done` (+ window.__introDone) so the
// Hero plays its masked reveal AFTER. Plays on every full page load; it lives in the
// persistent root layout, so client-side (next-view-transitions) navigation never
// remounts it — in-app nav crossfades instead of replaying. The reel starts hidden
// (CSS opacity:0) and is only revealed once the spin begins, so the reduced-motion
// path dismisses with no flash of static glyphs. Reduced-motion: dismiss instantly.

// Closed-drum geometry: FACES cells evenly spaced around a horizontal cylinder so
// off-centre glyphs tilt steeply away (the slot-machine look). THETA × FACES = 360°
// exactly, so there's no wrap-overlap and no blank — every face is a real glyph.
// RADIUS comes from the tiling condition r = (h/2)/tan(θ/2) so faces meet edge-to-edge.
const FACES = POOL.length // 12
const THETA = 360 / FACES // 30° per face
const CELL_PX = 64 // 4rem, matches $cell in the module
const RADIUS = Math.round(CELL_PX / 2 / Math.tan((THETA / 2) * (Math.PI / 180)))
const TURNS = 3 // full revolutions a drum spins before landing — the "spin"
const HOLD = 0.9 // beat the result holds before the reveal — long enough to read
const BLUR = 20 // px the page is blurred by before snapping into focus

function signalDone() {
  ;(window as typeof window & { __introDone?: boolean }).__introDone = true
  window.dispatchEvent(new Event('preloader:done'))
}

export function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const cover = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const triad = triadForPath(pathname)

  useLayoutEffect(() => {
    const el = root.current!
    const coverEl = cover.current!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      // Dismiss instantly; reel stays opacity:0 (CSS default) so no glyphs flash.
      el.style.display = 'none'
      signalDone()
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          el.style.display = 'none'
          signalDone()
        },
      })
      // Reveal the reel now that we're actually playing — kills the pre-hydration
      // flash of static glyphs on the non-animating paths.
      gsap.set(`.${styles.reel}`, { opacity: 1 })
      // Each drum spins TURNS full revolutions then settles the result face to front,
      // decelerating with an overshoot clack. z:-RADIUS recenters the drum so the front
      // glyph sits flat at full size. Drums are offset left-to-right (the "clack").
      const strips = gsap.utils.toArray<HTMLElement>(`.${styles.strip}`)
      gsap.set(strips, { z: -RADIUS })
      strips.forEach((strip, slot) => {
        const result = triad[slot] // pool index to land on the center row
        const landAngle = -(TURNS * 360 + result * THETA)
        const cruiseEnd = landAngle + 3 * THETA // settle covers the last 3 faces
        const at = slot * 0.16
        tl.fromTo(
          strip,
          { rotationX: 0 },
          { rotationX: cruiseEnd, duration: 0.7, ease: 'none' },
          at
        )
        tl.to(
          strip,
          { rotationX: landAngle, duration: 0.6, ease: 'back.out(1.4)' },
          at + 0.7
        )
      })
      // Once landed, tighten the fade band into the gap between the result glyph's ink
      // (~42–58%) and the neighbour rows' ink (~23% / ~76%), so the off-center rows
      // disappear entirely and only the result row remains.
      const rowfade = { v: 12 }
      tl.to(
        rowfade,
        {
          v: 38,
          duration: 0.5,
          ease: 'power2.inOut',
          onUpdate: () => el.style.setProperty('--rowfade', `${rowfade.v}%`),
        },
        '>-0.1'
      )
      // Hold on the result, then FOCUS the page in: the opaque cover fades to reveal
      // the page (blurred by the veil's backdrop-filter), and that blur resolves to 0
      // so it snaps sharp. The reel fades + drifts back as it clears.
      const blur = { v: BLUR }
      const applyBlur = () => {
        const f = `blur(${blur.v}px)`
        el.style.backdropFilter = f
        el.style.setProperty('-webkit-backdrop-filter', f)
      }
      tl.addLabel('reveal', `>+${HOLD}`)
      tl.to(
        `.${styles.reel}`,
        { opacity: 0, scale: 0.96, duration: 0.5, ease: 'power2.in' },
        'reveal'
      )
        .to(coverEl, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 'reveal')
        .to(
          blur,
          { v: 0, duration: 1.0, ease: 'power2.out', onUpdate: applyBlur },
          'reveal'
        )
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className={styles.preloader} aria-hidden="true">
      <div ref={cover} className={styles.cover} />
      <div className={styles.reel}>
        {triad.map((_, slot) => (
          <div key={slot} className={styles.slot}>
            <div className={styles.strip}>
              {POOL.map((mark, i) => (
                <div
                  key={i}
                  className={styles.cell}
                  style={{
                    transform: `rotateX(${i * THETA}deg) translateZ(${RADIUS}px)`,
                  }}
                >
                  {mark}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
