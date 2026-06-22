import type { ReactNode } from 'react'

// The reel's icon pool — monochrome line marks in the Services pictogram language
// (viewBox 40, stroke 2, fill none, round joins). Each route claims a DETERMINISTIC
// triad from this set, so the three glyphs that land in the preloader double as a
// per-page signature (and render identically on server + client — no hydration
// drift, no flash of the wrong icons). Code is canonical; this is a first-draft
// pool meant to be redlined.
const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
}

export const POOL: ReactNode[] = [
  // 0 · diamond
  <svg viewBox="0 0 40 40" {...S}>
    <path d="M20 5 35 20 20 35 5 20Z" />
  </svg>,
  // 1 · cross
  <svg viewBox="0 0 40 40" {...S}>
    <path d="M9 9 31 31M31 9 9 31" />
  </svg>,
  // 2 · play / triangle-right
  <svg viewBox="0 0 40 40" {...S}>
    <path d="M15 8 32 20 15 32Z" />
  </svg>,
  // 3 · ring
  <svg viewBox="0 0 40 40" {...S}>
    <circle cx="20" cy="20" r="13" />
  </svg>,
  // 4 · square
  <svg viewBox="0 0 40 40" {...S}>
    <rect x="8" y="8" width="24" height="24" rx="2" />
  </svg>,
  // 5 · triangle-up
  <svg viewBox="0 0 40 40" {...S}>
    <path d="M20 7 34 32 6 32Z" />
  </svg>,
  // 6 · asterisk / spark
  <svg viewBox="0 0 40 40" {...S}>
    <path d="M20 6v28M8 13l24 14M32 13 8 27" />
  </svg>,
  // 7 · half-disc (the robot-eye homage)
  <svg viewBox="0 0 40 40" {...S}>
    <circle cx="20" cy="20" r="13" />
    <path d="M20 7A13 13 0 0 0 20 33Z" fill="currentColor" stroke="none" />
  </svg>,
  // 8 · wave
  <svg viewBox="0 0 40 40" {...S}>
    <path d="M6 21q4-11 8 0t8 0" />
  </svg>,
  // 9 · hexagon
  <svg viewBox="0 0 40 40" {...S}>
    <path d="M20 6 32 13 32 27 20 34 8 27 8 13Z" />
  </svg>,
  // 10 · clock / arc
  <svg viewBox="0 0 40 40" {...S}>
    <circle cx="20" cy="20" r="13" />
    <path d="M20 20V12M20 20h6" />
  </svg>,
  // 11 · bars / text
  <svg viewBox="0 0 40 40" {...S}>
    <path d="M10 14h20M10 20h20M10 26h13" />
  </svg>,
]

// Per-section triads, keyed by the first path segment. Home echoes Love, Death +
// Robots' heart/✕/robot rhythm without copying it: diamond · cross · half-disc.
const TRIADS: Record<string, [number, number, number]> = {
  home: [0, 1, 7],
  work: [3, 4, 9],
  notes: [11, 6, 5],
  lab: [8, 10, 2],
}

/** The three pool indices a route lands on. Sub-routes inherit their section's
 *  triad (a note shares the notes family); unknown sections hash to a stable triad. */
export function triadForPath(pathname: string): [number, number, number] {
  const seg = pathname.split('/').filter(Boolean)[0] ?? 'home'
  if (TRIADS[seg]) return TRIADS[seg]

  // Unknown first segment → deterministic hash into 3 distinct pool indices.
  let h = 0
  for (let i = 0; i < seg.length; i++) h = (h * 31 + seg.charCodeAt(i)) >>> 0
  const n = POOL.length
  const a = h % n
  const b = (a + 1 + ((h >>> 4) % (n - 1))) % n
  let c = (b + 1 + ((h >>> 8) % (n - 1))) % n
  if (c === a) c = (c + 1) % n
  return [a, b, c]
}
