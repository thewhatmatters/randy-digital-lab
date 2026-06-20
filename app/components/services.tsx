import type { CSSProperties } from 'react'
import { SectionLabel } from './section-label'
import styles from './services.module.scss'

// Services bento — five capabilities placed on the page's 12-column grid as
// asymmetric tiles (not a uniform card grid). Each tile carries a small 100×100
// image placeholder, a mono index, a title, and a one-line blurb. Pure markup +
// tokens, so it stays a Server Component; motion is CSS-tier (rise-in stagger +
// hover wake), disabled under prefers-reduced-motion.
//
// Placement is per-tile via --col / --row custom props (applied only at the
// desktop grid breakpoint; mobile stacks to a single column). Two full rows:
// row 1 is 01 (span 7) + 02 (span 5); row 2 is three equal quarters (03/04/05).
type Service = {
  no: string
  title: string
  blurb: string
  /** desktop grid-column, e.g. '1 / 8' (span 7) */
  col: string
  /** desktop grid-row */
  row: number
}

const SERVICES: Service[] = [
  {
    no: '01',
    title: 'Design',
    blurb: 'Interfaces and identities with a point of view.',
    col: '1 / 8', // span 7
    row: 1,
  },
  {
    no: '02',
    title: 'Development',
    blurb: 'Production-grade builds — fast and maintainable.',
    col: '8 / 13', // cols 8–12 (span 5)
    row: 1,
  },
  {
    no: '03',
    title: 'Strategy',
    blurb: 'Product thinking and positioning before pixels.',
    col: '1 / 5', // cols 1–4
    row: 2,
  },
  {
    no: '04',
    title: 'Motion',
    blurb: 'Considered animation that earns its place.',
    col: '5 / 9', // cols 5–8
    row: 2,
  },
  {
    no: '05',
    title: 'Systems',
    blurb: 'Design systems that keep teams in lockstep.',
    col: '9 / 13', // cols 9–12
    row: 2,
  },
]

export function Services() {
  return (
    <section aria-labelledby="services-label" className={styles.services}>
      <SectionLabel id="services-label">Services</SectionLabel>

      <ul className={styles.bento}>
        {SERVICES.map((s, i) => (
          <li
            key={s.no}
            className={styles.tile}
            style={
              {
                '--col': s.col,
                '--row': s.row,
                '--i': i,
              } as CSSProperties
            }
          >
            {/* 100×100 image placeholder — swap for a real figure when art exists */}
            <div className={styles.media} aria-hidden="true">
              <span className={styles.mediaLabel}>{s.no}</span>
            </div>

            <h3 className={styles.title}>{s.title}</h3>
            <p className={styles.blurb}>{s.blurb}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
