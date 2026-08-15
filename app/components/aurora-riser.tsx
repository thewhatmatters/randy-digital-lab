import { AURORA_BARS } from './aurora-bars'
import styles from './aurora-riser.module.scss'

// The aurora riser — one definition, two seats.
//
// The gesture: the footer bloom's equalizer, stood up across a viewport. Bars
// grow from the bottom edge, hold while the page underneath swaps, then the
// whole panel travels up and off the top. Seats:
//
//   1. app/components/aurora-sweep.tsx — the shipped route transition, seated
//      in a fixed full-viewport veil and driven by a click interceptor.
//   2. app/components/aurora-transition.tsx — lab experiment 02, seated in a
//      miniature site's own viewport and driven by that site's nav.
//
// Presentational only: the riser knows the arc, the skin and the timing, and
// nothing at all about routers, clicks or pages. Everything it needs to fit a
// seat comes from the seat itself, so a second seat costs no second copy of
// the geometry (aurora-riser.module.scss carries the whole of it).
//
// Deliberately NOT a 'use client' module (the aurora-bars.ts / work-morph.ts
// idiom): both seats are client islands today, but this component has no
// state, no effects and no handlers, so keeping it directive-free means a
// Server Component could render it tomorrow without a boundary hop.

/** Total run, end to end. The rise needs two moves (grow, then travel out), so
 *  it wants longer than a single-move band would. Mirrors the CSS fallback in
 *  aurora-riser.module.scss; pinned by tests/aurora-transition.test.ts. */
export const RISE_MS = 760

/** Point in the run where the light is densest, and so where the page swaps:
 *  the top of the growth, just before the panel starts travelling. The number
 *  is baked into the module's keyframes as well (the grow phase runs for this
 *  fraction of the run, and the travel holds until it); the test pins the two
 *  expressions together. */
export const RISE_PUSH_AT = 0.55

export function AuroraRiser({
  /** How long the whole run takes. The seat owns this because the seat owns
   *  the timers that swap the page underneath: one number drives both. */
  ms = RISE_MS,
  /** Seat-supplied placement (position/inset/z-index live with the seat). */
  className,
}: {
  ms?: number
  className?: string
}) {
  return (
    // The bloom's own markup: one bar per grid column, each at its arc height,
    // growing from the bottom edge. The panel then carries them off the top.
    // --rise-ms is set once here and inherited by the bars, so the run has a
    // single runtime source.
    <div
      className={className ? `${styles.riser} ${className}` : styles.riser}
      style={{ ['--rise-ms' as string]: `${ms}ms` }}
    >
      {AURORA_BARS.map((h, i) => (
        <span
          key={i}
          className={styles.riserBar}
          style={{ ['--bar-h' as string]: `${h}%` }}
        />
      ))}
    </div>
  )
}
