import type { ReactNode } from 'react'
import styles from './section-label.module.scss'

// Shared section eyebrow — the DESIGN.md "Mono label" role (uppercase,
// tracking-wide, muted mono). One source so every index header on the home
// page (Experience, Notes, …) stays identical.
export function SectionLabel({
  id,
  children,
}: {
  id?: string
  children: ReactNode
}) {
  return (
    <h2 id={id} className={styles.label}>
      {children}
    </h2>
  )
}
