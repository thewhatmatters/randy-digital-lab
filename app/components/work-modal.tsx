'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  WORK_CAROUSEL_ATTR,
  WORK_DETAIL_CONTENT_ATTR,
  WORK_PANEL_RADIUS_PX,
  WORK_TILE_ATTR,
  WORK_TILE_IMAGE_ATTR,
  WORK_TILE_RADIUS_PX,
} from './work-morph'
import styles from './work-modal.module.scss'

// Work project modal — the client shell the intercepted /work/[slug] route
// renders over the dimmed index (App Store "Today" pattern, per the recorded
// reference in .sagan/ledger/T-002/). The server-rendered detail (carousel +
// content section) arrives as children; this shell owns only behavior:
//
// - Shared-element morph: on open, the panel starts transformed + clipped so
//   its carousel header exactly covers the clicked tile's image
//   ([data-work-tile-image]), then grows to rest while the backdrop dims and
//   the content section fades in — the image the eye is already on is the
//   thing that moves. Close reverses the same WAAPI animations (interruptible
//   mid-open), then router.back() restores /work. Transform, clip-path and
//   opacity only.
// - prefers-reduced-motion: no morph — instant open, instant close.
// - Escape and backdrop click close; Tab is trapped inside the panel; focus
//   starts on the close button and returns to the source tile on close.
// - Body scroll locks while open (html overflow + scrollbar-gutter
//   compensation, plus `lenis:stop` so the inertia loop halts); the panel is
//   the scroller and carries data-lenis-prevent.
//
// Rendered through a portal to <body>: the site shell animates <main> with
// transforms (footer reveal), which would re-anchor position:fixed.

const OPEN_MS = 440
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)' // house rise-in ease
const CLOSE_RATE = 1.4 // exits deserve less ceremony than arrivals

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function WorkModal({
  slug,
  titleId,
  children,
}: {
  slug: string
  titleId: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const animsRef = useRef<Animation[]>([])
  const closingRef = useRef(false)

  useEffect(() => setMounted(true), [])

  // Scroll lock + focus return, tied to the modal's lifetime.
  useEffect(() => {
    if (!mounted) return
    const html = document.documentElement
    const scrollbarGap = window.innerWidth - html.clientWidth
    const prevOverflow = html.style.overflow
    const prevPadding = document.body.style.paddingRight
    html.style.overflow = 'hidden'
    if (scrollbarGap > 0) {
      // Keep the dimmed index from shifting when the scrollbar vanishes.
      document.body.style.paddingRight = `${scrollbarGap}px`
    }
    window.dispatchEvent(new Event('lenis:stop'))
    closeBtnRef.current?.focus()

    return () => {
      html.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadding
      window.dispatchEvent(new Event('lenis:start'))
      // Focus returns to the tile that opened us (it stayed mounted — the
      // index lives under the modal the whole time).
      document
        .querySelector<HTMLElement>(`[${WORK_TILE_ATTR}="${slug}"]`)
        ?.focus()
    }
  }, [mounted, slug])

  // Open morph. Runs once per mount, after the panel has laid out; skipped
  // entirely under reduced motion, when WAAPI is missing, or when the source
  // tile isn't in the DOM (e.g. deep-linked soft nav) — those cases open
  // instantly, which is also the reduced-motion contract.
  useLayoutEffect(() => {
    if (!mounted || prefersReducedMotion()) return
    const panel = panelRef.current
    const backdrop = backdropRef.current
    if (!panel || !backdrop || typeof panel.animate !== 'function') return
    const source = document.querySelector<HTMLElement>(
      `[${WORK_TILE_ATTR}="${slug}"] [${WORK_TILE_IMAGE_ATTR}]`
    )
    const header = panel.querySelector<HTMLElement>(`[${WORK_CAROUSEL_ATTR}]`)
    if (!source || !header) return

    const from = source.getBoundingClientRect()
    const to = header.getBoundingClientRect()
    if (to.width === 0) return
    // Both rects are 16:10, so one uniform scale maps header onto tile.
    const scale = from.width / to.width
    const dx = from.left - to.left
    const dy = from.top - to.top
    // Clip everything below the header at the start, so the scaled-down
    // panel IS the tile image — the content section grows out of it.
    const below = Math.max(0, panel.offsetHeight - header.offsetHeight)
    // The computed values are the truth (the CSS declares each radius once);
    // the constants are test-pinned mirrors for the unparseable-value case.
    const panelRadius =
      parseFloat(getComputedStyle(panel).borderRadius) || WORK_PANEL_RADIUS_PX
    const tileRadius =
      parseFloat(getComputedStyle(source).borderRadius) || WORK_TILE_RADIUS_PX
    panel.style.transformOrigin = 'top left'

    const anims: Animation[] = [
      panel.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
            // Radius is divided by the scale so it lands at the tile's own
            // corner rounding on screen.
            clipPath: `inset(0 0 ${below}px 0 round ${tileRadius / scale}px)`,
          },
          {
            transform: 'none',
            clipPath: `inset(0 0 0 0 round ${panelRadius}px)`,
          },
        ],
        { duration: OPEN_MS, easing: EASE_OUT, fill: 'both' }
      ),
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: OPEN_MS,
        easing: 'ease',
        fill: 'both',
      }),
    ]
    const content = panel.querySelector<HTMLElement>(
      `[${WORK_DETAIL_CONTENT_ATTR}]`
    )
    if (content) {
      // Image leads, words follow — the content fades in over the back half.
      anims.push(
        content.animate(
          [{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }],
          { duration: OPEN_MS, easing: 'ease-out', fill: 'both' }
        )
      )
    }
    animsRef.current = anims
  }, [mounted, slug])

  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    const done = () => router.back()

    const anims = animsRef.current
    if (prefersReducedMotion() || anims.length === 0) {
      done()
      return
    }
    // The reverse morph reads from the panel's top, so park the internal
    // scroll first (the content is fading out at the same time, which masks
    // the jump when the user had scrolled).
    panelRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    anims.forEach((anim) => {
      // reverse() is interruptible — a close mid-open turns back smoothly
      // from wherever the open got to.
      anim.reverse()
      if (typeof anim.updatePlaybackRate === 'function') {
        anim.updatePlaybackRate(-CLOSE_RATE)
      }
    })
    Promise.all(anims.map((anim) => anim.finished)).then(done, done)
  }, [router])

  // Escape closes; Tab cycles inside the panel (the background is aria-modal
  // hidden for AT — this keeps it unreachable for the keyboard too).
  useEffect(() => {
    if (!mounted) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      const inside = active ? panel.contains(active) : false
      if (e.shiftKey && (!inside || active === first)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (!inside || active === last)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mounted, close])

  // Portal target only exists client-side; the intercepted route is never
  // server-rendered as HTML (hard loads get the full page instead).
  if (!mounted) return null

  return createPortal(
    <div className={styles.root}>
      <div
        ref={backdropRef}
        className={styles.backdrop}
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-lenis-prevent
      >
        <div className={styles.closeWrap}>
          {/* The site's keycap-chip language (see command-bar): ESC keycap +
              muted label. aria-label wins name computation, so AT hears
              "Close", not "ESC close"; the Escape handler below stays the
              real shortcut — this button only mirrors it visually. */}
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.close}
            onClick={close}
            aria-label="Close"
            title="Close (Esc)"
          >
            <kbd className={styles.closeKey}>ESC</kbd>
            <span className={styles.closeLabel}>close</span>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
