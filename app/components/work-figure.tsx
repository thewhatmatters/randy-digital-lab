import Image from 'next/image'
import styles from './work-figure.module.scss'

// In-body figure for Work case pages: image + a "Fig. NNN" figcaption in the
// same visual register as the note's SaganLoop caption (mono/uppercase prefix,
// muted, reading measure). Server Component; registered in the MDX map.
//
// SVG sources are passed to next/image `unoptimized` — the image optimizer
// refuses SVG without `dangerouslyAllowSVG`, and a vector gains nothing from
// resizing anyway. Raster sources go through the optimizer as normal.
export function WorkFigure({
  src,
  alt,
  fig,
  caption,
  width = 1200,
  height = 750,
}: {
  src: string
  alt: string
  fig?: string
  caption?: string
  width?: number
  height?: number
}) {
  return (
    <figure className={styles.figure}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={styles.image}
        unoptimized={src.endsWith('.svg')}
      />
      {caption && (
        <figcaption className={styles.caption}>
          {fig && <span className={styles.fig}>Fig. {fig}</span>}
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
