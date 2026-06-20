'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './preloader.module.scss'

// First-load intro veil: holds briefly on the wordmark, then wipes up to reveal
// the page. Fires `preloader:done` (+ window.__introDone) so the Hero plays its
// masked reveal AFTER the wipe, not behind it. Once per session (sessionStorage)
// so internal navigation doesn't replay it. Reduced-motion: dismiss instantly.
function signalDone() {
  ;(window as typeof window & { __introDone?: boolean }).__introDone = true
  window.dispatchEvent(new Event('preloader:done'))
}

export function Preloader() {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = root.current!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const seen = sessionStorage.getItem('introSeen')

    if (seen || reduce) {
      el.style.display = 'none'
      sessionStorage.setItem('introSeen', '1')
      signalDone()
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          el.style.display = 'none'
          sessionStorage.setItem('introSeen', '1')
          signalDone()
        },
      })
      tl.fromTo(
        `.${styles.word}`,
        { yPercent: 40, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
      )
        .to(`.${styles.word}`, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          delay: 0.35,
        })
        .to(el, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '-=0.1')
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className={styles.preloader} aria-hidden="true">
      <span className={styles.word}>randy.digital</span>
    </div>
  )
}
