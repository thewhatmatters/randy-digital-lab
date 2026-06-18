'use client'

import { useEffect, useState } from 'react'

import styles from './grid-overlay.module.scss'

/**
 * Müller-Brockmann grid overlay. Controlled — visibility is owned by
 * <UIChrome> (toggled by the `g` key or the command-bar chip). Renders inside
 * the same centered `grid-page` box as real content (max-width + responsive
 * margins read from the same CSS vars), so what you see is the actual grid, not
 * a look-alike. Column count comes from --grid-cols. `aria-hidden` and
 * pointer-events:none so it never interferes with the page.
 */
export function GridOverlay({ on }: { on: boolean }) {
  const [colCount, setColCount] = useState(12)

  useEffect(() => {
    if (!on) return
    // mirror the single source of truth (--grid-cols) rather than hardcode
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--grid-cols')
    const n = parseInt(raw, 10)
    if (Number.isFinite(n) && n > 0) setColCount(n)
  }, [on])

  if (!on) return null

  const cols = Array.from({ length: colCount }, (_, i) => i + 1)

  return (
    <div aria-hidden className={styles.overlay}>
      <div className={`grid-page ${styles.page}`}>
        <div className={styles.baseline} />
        {cols.map((n) => (
          <div
            key={n}
            className={`${styles.col} relative`}
            style={{ gridColumn: `${n} / ${n + 1}`, gridRow: 1 }}
          >
            <span className={styles.num}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
