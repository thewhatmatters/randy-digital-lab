'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './hero.module.scss'

// Kinetic intro. The signature move is a masked, staggered line-reveal of the
// display headline (each line rises out of an overflow-clip); the bio and meta
// stagger in after, once the preloader has wiped away. Client island (GSAP);
// the rest of the page stays Server Components. Fully reduced-motion aware —
// everything just renders in place, no transforms.
const HEADLINE = ['Pixels to', 'production.']

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const ctx = gsap.context((self) => {
      const q = self!.selector!
      const lines = q(`.${styles.line}`)
      const fades = q('[data-fade]')

      // Set the hidden start state immediately (no flash), then play the
      // entrance once the preloader has wiped away.
      gsap.set(lines, { yPercent: 115 })
      gsap.set(fades, { y: 18, opacity: 0 })

      const play = () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.to(lines, { yPercent: 0, duration: 0.95, stagger: 0.12 })
          .to(fades, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 }, '-=0.45')
      }

      const w = window as typeof window & { __introDone?: boolean }
      if (w.__introDone) play()
      else window.addEventListener('preloader:done', play, { once: true })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className={styles.hero} aria-label="Intro">
      <div className={`grid-page ${styles.inner}`}>
        <h1 className={`${styles.headline} col-start-1 col-end-13`}>
          {HEADLINE.map((l) => (
            <span key={l} className={styles.lineMask}>
              <span className={styles.line}>{l}</span>
            </span>
          ))}
        </h1>

        <p
          data-fade
          className={`${styles.bio} col-start-1 col-end-13 md:col-end-7`}
        >
          A portfolio of work, notes on what I&rsquo;m thinking about, and a lab
          of small interactive experiments. Still taking shape.
        </p>

        <p
          data-fade
          className={`${styles.meta} col-start-1 col-end-13 md:col-start-9 md:col-end-13`}
        >
          <span className={styles.metaDot} aria-hidden="true" />
          Available for work
        </p>
      </div>
    </section>
  )
}
