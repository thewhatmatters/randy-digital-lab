import Image from 'next/image'
import styles from './margin.module.scss'

// Editorial margin — author-authored marginalia that lives inline in a note's
// MDX at the point it's relevant, and floats out into the right column anchored
// to that scroll position (the Tufte/sidenote model). On narrow viewports it
// collapses back into the reading column. The container is content-agnostic:
// anything React renders goes here — including the lab's interactive islands —
// so a live chart is just a client component dropped inside <Margin>.

export function Margin({
  label,
  children,
}: {
  label?: string
  children: React.ReactNode
}) {
  return (
    <aside className={styles.margin}>
      {label && <p className={styles.marginLabel}>{label}</p>}
      {children}
    </aside>
  )
}

// Pull quote — a line lifted from the prose, set large in the margin. Optional
// `from` attributes it (a source, a person) without the visual weight of the
// old colophon.
export function PullQuote({
  from,
  children,
}: {
  from?: string
  children: React.ReactNode
}) {
  return (
    <aside className={`${styles.margin} ${styles.pullquote}`}>
      {children}
    </aside>
  )
}

// Caption — small, muted supporting text in the margin: a chart's one-line
// annotation, a brief aside. Opt-in, so only what you wrap reads as secondary
// (vs. auto-styling every margin paragraph). Carries the module's .caption
// class, which raw MDX can't reference directly.
export function Caption({ children }: { children: React.ReactNode }) {
  return <p className={styles.caption}>{children}</p>
}

// Supporting image — a figure in the margin with an optional caption. Uses
// next/image so it stays optimized; pass explicit width/height (intrinsic) and
// it scales to the margin width.
export function Figure({
  src,
  alt,
  caption,
  width = 480,
  height = 320,
}: {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}) {
  return (
    <figure className={styles.margin}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={styles.figureImg}
      />
      {caption && (
        <figcaption className={styles.figureCaption}>{caption}</figcaption>
      )}
    </figure>
  )
}
