'use client'

import { useState } from 'react'
import { highlight } from 'sugar-high'
import styles from './dev-overlay.module.scss'

/**
 * Lab experiment 01 — the Next.js / Turbopack build-error overlay recreated as
 * a UI element, then gently subverted: the "errors" are developer in-jokes, the
 * red is the design system's accent, and it themes light/dark. Paginator and
 * copy button are real. Purely presentational otherwise.
 */
type Frame = {
  title: string
  file: string
  lines: string[]
  errorLine: number // 1-based
  trace: string[]
  doc: string
}

const FRAMES: Frame[] = [
  {
    title: "Module not found: Can't resolve 'work/life-balance'",
    file: './app/lab/priorities.ts (3:1)',
    lines: [
      "import { focus } from 'deep-work'",
      "import { rest } from 'good-sleep'",
      "import { balance } from 'work/life-balance'",
    ],
    errorLine: 3,
    trace: ['Server Component:', '  ./app/lab/priorities.ts', '  ./app/page.tsx'],
    doc: 'https://randy.digital/notes',
  },
  {
    title: "Module not found: Can't resolve 'silver-bullet'",
    file: './app/lab/architecture.ts (2:1)',
    lines: [
      "import { tradeoffs } from 'engineering'",
      "import { fix } from 'silver-bullet'",
    ],
    errorLine: 2,
    trace: ['Server Component:', '  ./app/lab/architecture.ts', '  ./app/page.tsx'],
    doc: 'https://randy.digital/notes',
  },
  {
    title: "Module not found: Can't resolve 'pixel-perfect/first-try'",
    file: './app/lab/design.ts (4:1)',
    lines: [
      "import { sketch } from 'iterate'",
      "import { revise } from 'iterate'",
      "import { ship } from 'iterate'",
      "import { perfection } from 'pixel-perfect/first-try'",
    ],
    errorLine: 4,
    trace: ['Server Component:', '  ./app/lab/design.ts', '  ./app/page.tsx'],
    doc: 'https://randy.digital/notes',
  },
]

function caretFor(line: string) {
  const lead = line.length - line.trimStart().length
  return ' '.repeat(lead) + '^'.repeat(line.trim().length)
}

export function DevOverlay() {
  const [i, setI] = useState(0)
  const [copied, setCopied] = useState(false)
  const count = FRAMES.length
  const frame = FRAMES[i]

  const prev = () => setI((v) => (v - 1 + count) % count)
  const next = () => setI((v) => (v + 1) % count)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(frame.lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <div className={styles.card} key={i}>
        {/* top row — paginator tab + status pill */}
        <div className={styles.top}>
          <div className={styles.tab} role="group" aria-label="Cycle errors">
            <button onClick={prev} className={styles.chev} aria-label="Previous">
              ‹
            </button>
            <span className={styles.count}>
              {i + 1}/{count}
            </span>
            <button onClick={next} className={styles.chev} aria-label="Next">
              ›
            </button>
          </div>
          <div className={styles.status}>
            <span className={styles.dot} aria-hidden />
            Next.js 16.0.10 <span className={styles.stale}>(stale)</span>
            <span className={styles.turbo}>Turbopack</span>
          </div>
        </div>

        {/* badge row + icon buttons */}
        <div className={styles.badgerow}>
          <span className={styles.badge}>Build Error</span>
          <div className={styles.icons}>
            <button onClick={copy} className={styles.icon} aria-label="Copy code">
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
            <button className={styles.icon} aria-label="Docs" type="button">
              <BookIcon />
            </button>
            <button className={styles.icon} aria-label="More" type="button">
              <CubeIcon />
            </button>
          </div>
        </div>

        <h3 className={styles.title}>{frame.title}</h3>

        {/* code frame */}
        <div className={styles.frame}>
          <div className={styles.frameHead}>
            <span className={styles.file}>
              <AtomIcon />
              {frame.file}
            </span>
            <button className={`${styles.icon} ${styles.iconSm}`} aria-label="Open file" type="button">
              <ExternalIcon />
            </button>
          </div>
          <div className={styles.code}>
            <div className={styles.msg}>{frame.title}</div>
            {frame.lines.map((ln, idx) => {
              const n = idx + 1
              const isErr = n === frame.errorLine
              return (
                <div key={n}>
                  <div className={styles.row} data-error={isErr || undefined}>
                    <span className={styles.gutter}>
                      <span className={styles.ptr}>{isErr ? '>' : ' '}</span> {n} |{' '}
                    </span>
                    <code
                      className={styles.src}
                      dangerouslySetInnerHTML={{ __html: highlight(ln) }}
                    />
                  </div>
                  {isErr && (
                    <div className={styles.row}>
                      <span className={styles.gutter}>{'  '} |{' '}</span>
                      <span className={styles.caret}>{caretFor(ln)}</span>
                    </div>
                  )}
                </div>
              )
            })}
            <div className={styles.trace}>
              {frame.trace.map((t, k) => (
                <div key={k}>{t}</div>
              ))}
            </div>
            <a className={styles.doc} href={frame.doc}>
              {frame.doc}
            </a>
          </div>
        </div>
      </div>
  )
}

/* --- icons (currentColor, 16px) --- */
function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
      <path d="M18 3v18" />
    </svg>
  )
}
function CubeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 3 7v10l9 5 9-5V7z" />
      <path d="M3 7l9 5 9-5M12 12v10" />
    </svg>
  )
}
function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    </svg>
  )
}
function AtomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(120 12 12)" />
    </svg>
  )
}
