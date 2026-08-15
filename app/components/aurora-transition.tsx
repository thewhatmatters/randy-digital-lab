'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { AuroraRiser, RISE_MS, RISE_PUSH_AT } from './aurora-riser'
import styles from './aurora-transition.module.scss'

/**
 * Lab experiment 02 — the site's own page transition, running inside a frame.
 *
 * The shipped effect (app/components/aurora-sweep.tsx) is full-viewport and
 * welded to the router, and a lab frame is a clipped box with no routing. A
 * demo that never changes a page is not showing a page transition, so this is
 * a working miniature site instead: three pages, its own nav, real content
 * changes, and the aurora covering the moment of the change. Its "pages" are
 * content, not routes: no router, no links, no history entries, so activating
 * this nav can never navigate the real site or wake the real transition.
 *
 * The rise is not reimplemented here. It is AuroraRiser, the same component
 * and the same stylesheet the route transition uses, seated in the miniature's
 * viewport instead of the real one; the miniature declares that viewport a
 * size container and the riser's geometry scales to it untouched. What IS only
 * here is the horizontal SWEEP band, the earlier variant, which left
 * production in T-012 and survives as a viewer-facing toggle so the two
 * gestures can be compared side by side.
 *
 * Reduced motion: nothing animates and no timer ever starts. The nav still
 * changes the page, instantly, and the gesture layer stays on screen as a
 * still of the run (see the reduced-motion block in each module) so the
 * experiment shows what it is instead of showing nothing.
 */

type PageId = 'base' | 'work' | 'notes'
type Gesture = 'rise' | 'sweep'

/** The miniature's nav, in the real site's own vocabulary and order. Order is
 *  load-bearing for the sweep: it is what gives the band a direction. */
const PAGES: { id: PageId; title: string }[] = [
  { id: 'base', title: 'Base' },
  { id: 'work', title: 'Work' },
  { id: 'notes', title: 'Notes' },
]

/** The sweep's own timing. One move, not two, so it wants less time than the
 *  rise, and its densest moment comes earlier. Mirrors the --band-ms fallback
 *  in aurora-transition.module.scss (pinned by tests/aurora-transition.test.ts). */
const BAND_MS = 620
const BAND_PUSH_AT = 0.4

const NOTE_DATES = ['2026.06', '2026.02', '2025.11']

export function AuroraTransition() {
  const [page, setPage] = useState<PageId>('base')
  /** What the toggle says: the gesture the NEXT run will play. Always follows
   *  the click immediately, so the control never feels dead. */
  const [gesture, setGesture] = useState<Gesture>('rise')
  /** What is actually on screen: the gesture the CURRENT run started with,
   *  captured at go() and left alone until the run ends. Two values because a
   *  run is a continuous move — swapping the layer halfway through would drop
   *  a half-played gesture and start a fresh one from its own from-state, which
   *  reads as a glitch rather than as a choice. */
  const [runGesture, setRunGesture] = useState<Gesture>('rise')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [playing, setPlaying] = useState(false)
  const [reduced, setReduced] = useState(false)
  const running = useRef(false)
  const timers = useRef<number[]>([])

  // Read the preference after mount (never during render — the server has no
  // opinion, and starting at false keeps hydration honest), and keep listening:
  // switching the OS setting with the page open should switch the experiment.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const go = (next: PageId) => {
    if (next === page) return

    // Reduced motion: change the page and stop. No layer to start, no timers
    // to schedule, nothing left running behind the frame.
    if (reduced) {
      setPage(next)
      return
    }

    // One run at a time — a second activation mid-run would restart the layer
    // under itself. The whole run is under a second.
    if (running.current) return
    running.current = true

    const ms = gesture === 'rise' ? RISE_MS : BAND_MS
    const pushAt = gesture === 'rise' ? RISE_PUSH_AT : BAND_PUSH_AT

    setDirection(
      PAGES.findIndex((p) => p.id === next) >=
        PAGES.findIndex((p) => p.id === page)
        ? 'forward'
        : 'back'
    )
    // Freeze the gesture for the length of the run. From here until the run
    // ends the toggle may move as much as it likes; the layer does not.
    setRunGesture(gesture)
    setPlaying(true)

    // The swap, at the densest moment of the light — the same contract the
    // route transition keeps with the router.
    timers.current.push(window.setTimeout(() => setPage(next), ms * pushAt))
    timers.current.push(
      window.setTimeout(() => {
        running.current = false
        setPlaying(false)
      }, ms)
    )
  }

  const current = PAGES.find((p) => p.id === page) ?? PAGES[0]

  // The layer follows the run while there is one, and the toggle the rest of
  // the time (under reduced motion there is never a run, so the parked still
  // switches the instant the toggle is pressed).
  const shown = playing ? runGesture : gesture

  return (
    <div className={styles.root}>
      <div className={styles.tools}>
        {/* Which gesture the next navigation plays. Pressing it always takes
            effect immediately as a choice (the pressed state moves under the
            finger); if a run happens to be in flight, that run finishes in the
            gesture it started with and the new choice takes the screen on the
            very next nav — under a second away. */}
        <div className={styles.segmented} role="group" aria-label="Gesture">
          {(['rise', 'sweep'] as Gesture[]).map((g) => (
            <button
              key={g}
              type="button"
              className={styles.segBtn}
              aria-pressed={g === gesture}
              onClick={() => setGesture(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.window}>
        <nav className={styles.chrome} aria-label="Miniature site">
          {PAGES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={styles.navItem}
              aria-current={p.id === page ? 'page' : undefined}
              onClick={() => go(p.id)}
            >
              <span className={styles.navNum}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{p.id}</span>
            </button>
          ))}
        </nav>

        <div className={styles.viewport}>
          {/* Not keyed: the heading below is a live region, and it can only
              announce a change if the same node survives the change. */}
          <div className={styles.page}>
            <h3 className={styles.pageTitle} aria-live="polite">
              {current.title}
            </h3>
            {page === 'base' && (
              <>
                <p className={styles.lede}>
                  Portfolio, notes, and a lab of live experiments.
                </p>
                <div className={styles.rules} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </>
            )}
            {page === 'work' && (
              <div className={styles.tiles} aria-hidden="true">
                {['01', '02', '03', '04', '05', '06'].map((n) => (
                  <div key={n} className={styles.tile}>
                    <span className={styles.tileNum}>{n}</span>
                  </div>
                ))}
              </div>
            )}
            {page === 'notes' && (
              <ul className={styles.rows} aria-hidden="true">
                {NOTE_DATES.map((d) => (
                  <li key={d} className={styles.row}>
                    <span className={styles.rowDate}>{d}</span>
                    <span className={styles.rowBar} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* The gesture layer. It plays for the length of a run, and under
              reduced motion it is simply always there, parked. */}
          {(playing || reduced) && (
            <div className={styles.layer} aria-hidden="true">
              {shown === 'rise' ? (
                <AuroraRiser ms={RISE_MS} />
              ) : (
                <div
                  className={`${styles.band} ${styles[direction]}`}
                  style={{ ['--band-ms' as string]: `${BAND_MS}ms` }}
                >
                  {/* Eleven solid steps under one blur — the same spectrum
                      laid on its side. */}
                  {Array.from({ length: 11 }, (_, i) => (
                    <span key={i} className={styles.step} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
