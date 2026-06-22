'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './motion-timeline.module.scss'

// MotionTimeline — the Motion facet's "tool", third of the trio (after CodeWindow
// and DesignCanvas): a depicted video/motion editor with the site's own motion
// stack on the tracks. The cascading clips are the real rise-in stagger; the
// tracks name the actual pieces (hero reveal, rise-in, stagger, Lenis scroll).
// Fixed intrinsic size, anchored top-left, clipped by the panel. Theme-aware
// chrome on semantic tokens; the one accent moment is the playhead.
//
// A small client island: on hover a rAF loop scrubs the playhead across the
// timeline while the frame counter + timecode count up (driven via refs, so no
// per-frame React re-render); on mouse-out it snaps back to the default. The
// scrub sits out under prefers-reduced-motion.

const FPS = 30
const DEFAULT_FRAME = 32 // 00:01.02
const REM_PER_SEC = 4.25 // matches the ruler tick spacing
const LOOP_FRAME = 330 // ~11s, then wrap back to the start

const pad = (n: number) => String(n).padStart(2, '0')
function timecode(frame: number) {
  const totalSec = Math.floor(frame / FPS)
  return `${pad(Math.floor(totalSec / 60))}:${pad(totalSec % 60)}.${pad(frame % FPS)}`
}
// Ruler labels are mm:ss (no frames), like a video scrubber.
const clock = (sec: number) => `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`

// Left-column tracks. The first is the "media" comp (filmstrip); the rest are
// sequence layers — colour-coded event clips, offset to read as the rise-in
// stagger.
type Tone = 'rise' | 'stagger' | 'scroll' | 'view'
type Track = {
  name: string
  kind: 'media' | 'clip'
  offset: number
  tone?: Tone
  /** square the left corners — reads as continuing off-screen to the left */
  openLeft?: boolean
}
const TRACKS: Track[] = [
  { name: 'hero-reveal.tsx', kind: 'media', offset: 0 },
  { name: 'rise-in', kind: 'clip', offset: 0, tone: 'rise', openLeft: true },
  { name: 'stagger', kind: 'clip', offset: 18, tone: 'stagger' },
  { name: 'lenis-scroll', kind: 'clip', offset: 36, tone: 'scroll' },
  { name: 'view-transition', kind: 'clip', offset: 54, tone: 'view' },
]

const TONE_CLASS: Record<Tone, string> = {
  rise: styles.toneRise,
  stagger: styles.toneStagger,
  scroll: styles.toneScroll,
  view: styles.toneView,
}

// White marks shown inside the colour-coded event clips.
const ClipIcon = ({ tone }: { tone: Tone }) => {
  if (tone === 'rise')
    return (
      <svg className={styles.clipIcon} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2 13C5 13 6 3 14 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  if (tone === 'stagger')
    return (
      <svg className={styles.clipIcon} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2 4h7M4 8h8M6 12h7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  if (tone === 'scroll')
    return (
      <svg className={styles.clipIcon} viewBox="0 0 16 16" aria-hidden="true">
        <rect x="5" y="2" width="6" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 4.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    )
  // view-transition — two overlapping frames (a crossfade between views)
  return (
    <svg className={styles.clipIcon} viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.5" y="3" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <rect x="6" y="5.5" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

const Eye = () => (
  <svg className={styles.eye} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" fill="none" stroke="currentColor" strokeWidth="1.1" />
    <circle cx="8" cy="8" r="1.8" fill="currentColor" />
  </svg>
)

// — transport icons —
const Minus = () => <path d="M3 8h10" stroke="currentColor" strokeWidth="1.4" />
const Plus = () => <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.4" />
const Caret = () => <path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
const SkipStart = () => (
  <>
    <path d="M4 4v8" stroke="currentColor" strokeWidth="1.4" />
    <path d="M13 4 6 8l7 4z" fill="currentColor" />
  </>
)
const PrevFrame = () => (
  <>
    <path d="M5 4v8" stroke="currentColor" strokeWidth="1.4" />
    <path d="M13 4 6 8l7 4z" fill="currentColor" />
  </>
)
const Play = () => <path d="M5 3.5 13 8l-8 4.5z" fill="currentColor" />
const Pause = () => (
  <>
    <rect x="4.5" y="3.5" width="2.5" height="9" rx="0.5" fill="currentColor" />
    <rect x="9" y="3.5" width="2.5" height="9" rx="0.5" fill="currentColor" />
  </>
)
const NextFrame = () => (
  <>
    <path d="M3 4 10 8l-7 4z" fill="currentColor" />
    <path d="M11 4v8" stroke="currentColor" strokeWidth="1.4" />
  </>
)
const Loop = () => (
  <path
    d="M4 7a4 4 0 0 1 7-2.5M12 9a4 4 0 0 1-7 2.5M11 3v2H9M5 13v-2h2"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinejoin="round"
  />
)
const Volume = () => (
  <>
    <path d="M3 6v4h2l3 2.5v-9L5 6z" fill="currentColor" />
    <path d="M10 6.5a2.5 2.5 0 0 1 0 3M11.5 5a4.5 4.5 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.1" />
  </>
)

const Btn = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <span className={styles.btn} title={label}>
    <svg viewBox="0 0 16 16" aria-hidden="true">
      {children}
    </svg>
  </span>
)

// One tick per second (00:01.00 … 00:06.00), positioned at the same scale the
// playhead scrubs by, so the resting head reads as just past 00:01.00.
const RULER_SECS = [1, 2, 3, 4, 5, 6]

export function MotionTimeline() {
  const playheadRef = useRef<HTMLDivElement>(null)
  const tcRef = useRef<HTMLSpanElement>(null)
  const frameRef = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const curFrameRef = useRef(DEFAULT_FRAME)
  const [playing, setPlaying] = useState(false)

  const reduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Paint a frame via refs — no per-frame React re-render.
  const render = (frame: number) => {
    curFrameRef.current = frame
    const dx = ((frame - DEFAULT_FRAME) / FPS) * REM_PER_SEC
    if (playheadRef.current)
      playheadRef.current.style.transform = dx ? `translateX(${dx}rem)` : ''
    if (tcRef.current) tcRef.current.textContent = timecode(frame)
    if (frameRef.current) frameRef.current.textContent = String(frame)
  }

  // Play forward from the current frame; loop back to the start at the end.
  const play = () => {
    if (reduced() || rafRef.current != null) return
    let base = curFrameRef.current
    startRef.current = performance.now()
    setPlaying(true)
    const tick = (now: number) => {
      let frame = base + Math.floor(((now - startRef.current) / 1000) * FPS)
      if (frame >= LOOP_FRAME) {
        base = DEFAULT_FRAME
        startRef.current = now
        frame = DEFAULT_FRAME
      }
      render(frame)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const pause = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setPlaying(false)
  }

  const toggle = () => (rafRef.current != null ? pause() : play())

  // Mouse-out — pause and snap the head back to the default position.
  const reset = () => {
    pause()
    render(DEFAULT_FRAME)
  }

  // Stop a running scrub if the island unmounts mid-hover.
  useEffect(() => () => pause(), [])

  return (
    <div
      className={styles.timeline}
      aria-hidden="true"
      onMouseEnter={play}
      onMouseLeave={reset}
    >
      {/* ── transport bar ── */}
      <div className={styles.transport}>
        <span className={styles.zoom}>
          <svg viewBox="0 0 16 16" className={styles.zoomIcon}>
            <Minus />
          </svg>
          <span className={styles.slider}>
            <span className={styles.sliderKnob} />
          </span>
          <svg viewBox="0 0 16 16" className={styles.zoomIcon}>
            <Plus />
          </svg>
        </span>

        <span className={styles.select}>
          Fit
          <svg viewBox="0 0 16 16" className={styles.caret}>
            <Caret />
          </svg>
        </span>
        <span className={styles.select}>
          1x
          <svg viewBox="0 0 16 16" className={styles.caret}>
            <Caret />
          </svg>
        </span>

        <span className={styles.controls}>
          <Btn label="To start">
            <SkipStart />
          </Btn>
          <Btn label="Previous frame">
            <PrevFrame />
          </Btn>
          <span
            className={styles.btn}
            onClick={toggle}
            title={playing ? 'Pause' : 'Play'}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              {playing ? <Pause /> : <Play />}
            </svg>
          </span>
          <Btn label="Next frame">
            <NextFrame />
          </Btn>
          <Btn label="Loop">
            <Loop />
          </Btn>
          <Btn label="Volume">
            <Volume />
          </Btn>
        </span>
      </div>

      {/* ── body: track heads + lanes ── */}
      <div className={styles.body}>
        <div className={styles.heads}>
          <div className={styles.timecode}>
            <span className={styles.tc} ref={tcRef}>
              00:01.02
            </span>
            <span className={styles.frame} ref={frameRef}>
              32
            </span>
          </div>
          {TRACKS.map((t) => (
            <div key={t.name} className={styles.headRow}>
              <Eye />
              <span
                className={`${styles.trackName} ${t.kind === 'clip' ? styles.trackNameSub : ''}`}
              >
                {t.name}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.lanes}>
          <div className={styles.ruler}>
            {RULER_SECS.map((sec) => (
              <span
                key={sec}
                className={styles.tick}
                style={{ left: `${sec * REM_PER_SEC}rem` }}
              >
                {clock(sec)}
              </span>
            ))}
          </div>

          <div className={styles.playhead} ref={playheadRef}>
            <span className={styles.playheadGrip} />
          </div>

          {TRACKS.map((t) => (
            <div key={t.name} className={styles.lane}>
              {t.kind === 'media' ? (
                <div className={styles.filmstrip}>
                  {Array.from({ length: 16 }, (_, i) => (
                    <span key={i} className={styles.frameCell}>
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M6 4.5 11.5 8 6 11.5z" fill="currentColor" />
                      </svg>
                    </span>
                  ))}
                </div>
              ) : (
                <div
                  className={`${styles.clip} ${t.tone ? TONE_CLASS[t.tone] : ''} ${t.openLeft ? styles.clipOpenLeft : ''}`}
                  style={{ marginLeft: `${t.offset}%` }}
                >
                  {t.tone ? <ClipIcon tone={t.tone} /> : null}
                  <span className={styles.clipLabel}>{t.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
