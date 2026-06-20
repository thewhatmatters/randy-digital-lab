'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'next-view-transitions'
import { WorldClock } from './world-clock'
import { FooterMap } from './footer-map'
import styles from './footer.module.scss'

gsap.registerPlugin(ScrollTrigger)

const EXPLORE = [
  { label: 'Base', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Lab', href: '/lab' },
  { label: 'Notes', href: '/notes' },
]

const CONNECT = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/randymdaniel' },
  { label: 'GitHub', href: 'https://github.com/thewhatmatters' },
  { label: 'X (Twitter)', href: 'https://x.com/randydigital' },
]

export default function Footer() {
  const root = useRef<HTMLElement>(null)
  // hovered world-clock city → drives the footer map (null = back to Austin)
  const [activeCity, setActiveCity] = useState<string | null>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context((self) => {
      gsap.from(self!.selector!('[data-fr]'), {
        y: 18,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: root.current!, start: 'top 88%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <footer ref={root} className={`grid-page ${styles.footer}`}>
      {/* row 1 — logo lockup (placeholders; swap each for an <img>/SVG later) */}
      <div
        data-fr
        className={`col-start-1 col-end-13 md:row-start-1 ${styles.lockup}`}
      >
        <div className={styles.logo}>randy.digital</div>
        <span className={styles.lockupDivider} aria-hidden="true" />
        <div className={styles.logo}>whatmatters</div>
      </div>

      {/* row 2 left — description + clocks (subgrid keeps clocks on the columns) */}
      <div
        data-fr
        className={`col-start-1 col-end-13 md:col-end-8 md:row-start-2 md:grid md:grid-cols-subgrid md:content-start ${styles.intro}`}
      >
        <p className={`md:col-span-full ${styles.desc}`}>
          A portfolio of work, notes on what I&rsquo;m thinking about, and a lab
          of small interactive experiments. Still taking shape.
        </p>
        {/* interactive map — spans the 4 world-clock columns; defaults to
            Austin (accent), animates to a city on hover (next step). */}
        <FooterMap className={styles.map} activeCity={activeCity} />
        <WorldClock onCity={setActiveCity} />
        <p className={`md:col-span-full ${styles.status}`}>
          <span className={styles.statusDot} aria-hidden="true" />
          Available for work
        </p>
      </div>

      {/* row 2 right — link columns, tops aligned with the description */}
      <nav
        data-fr
        aria-label="Explore"
        className={`col-start-1 col-end-7 md:col-start-9 md:col-end-11 md:row-start-2 ${styles.col}`}
      >
        <p className={styles.colLabel}>Explore</p>
        {EXPLORE.map((i) => (
          <Link key={i.href} href={i.href} className={styles.colLink}>
            {i.label}
          </Link>
        ))}
      </nav>

      <div
        data-fr
        className={`col-start-7 col-end-13 md:col-start-11 md:col-end-13 md:row-start-2 ${styles.col}`}
      >
        <p className={styles.colLabel}>Connect</p>
        {CONNECT.map((i) => (
          <a
            key={i.href}
            href={i.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.colLink}
          >
            {i.label} <span className={styles.arrow}>↗</span>
          </a>
        ))}
      </div>
    </footer>
  )
}
