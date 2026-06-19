import { useId } from 'react'
import { scaleLinear } from '@visx/scale'
import { LinePath, AreaClosed } from '@visx/shape'
import { curveMonotoneX, curveLinear } from '@visx/curve'
import styles from './line-chart.module.scss'

// Themed line chart — our wrapper over visx primitives (@visx/scale for the
// math, @visx/shape for the path). It renders pure SVG with no browser APIs,
// so it stays a Server Component: zero client JS, drawn in the RSC pass like a
// hand-authored figure, but with the geometry computed from real data. Styling
// comes from our tokens (var(--fg)/--accent/--muted/--font-mono), so it tracks
// the theme automatically. For an *interactive* chart (hover/tooltip) make a
// client-island variant — that's the only case that ships JS.

type Point = { x: number; y: number }

export function LineChart({
  points,
  width = 160,
  height = 90,
  padding = 6,
  stroke = 'var(--fg)',
  strokeWidth = 2,
  curve = 'monotone',
  marker,
  regions = false,
  label,
}: {
  points: Point[]
  /** viewBox units — the chart scales to its container; this only sets aspect. */
  width?: number
  height?: number
  padding?: number
  stroke?: string
  strokeWidth?: number
  /** Curve interpolation — gentle monotone (default) or straight segments. */
  curve?: 'monotone' | 'linear'
  /** A vertical reference line (e.g. the "60%" threshold), accent by default. */
  marker?: { at: number; color?: string; label?: string }
  /**
   * With a marker set, fill the area under the curve on each side of it: a soft
   * gradient before (the reliable zone fading) and a diagonal hatch after (the
   * degraded, "noisy" zone). Semantic, not decoration — opt-in per chart.
   */
  regions?: boolean
  /** Required: describes the chart for screen readers. */
  label: string
}) {
  // Unique per instance so multiple charts on a page don't share <defs> ids.
  const uid = useId()
  const gradId = `lc-grad-${uid}`
  const hatchId = `lc-hatch-${uid}`
  const leftClipId = `lc-left-${uid}`
  const rightClipId = `lc-right-${uid}`

  const xs = points.map((d) => d.x)
  const ys = points.map((d) => d.y)

  const xScale = scaleLinear({
    domain: [Math.min(...xs), Math.max(...xs)],
    range: [padding, width - padding],
  })
  const yScale = scaleLinear({
    domain: [Math.min(...ys), Math.max(...ys)],
    range: [height - padding, padding],
  })

  const markerX = marker ? xScale(marker.at) : 0
  const showRegions = regions && !!marker
  const curveFn = curve === 'linear' ? curveLinear : curveMonotoneX

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className={styles.chart}
    >
      {showRegions && (
        <defs>
          {/* Reliable zone: a soft fade of the data ink, no second color. */}
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--fg)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--fg)" stopOpacity="0" />
          </linearGradient>
          {/* Degraded zone: hairline diagonal hatch reads as noise/texture. */}
          <pattern
            id={hatchId}
            width="3.5"
            height="3.5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="3.5"
              stroke="var(--muted)"
              strokeWidth="0.5"
            />
          </pattern>
          <clipPath id={leftClipId}>
            <rect x="0" y="0" width={markerX} height={height} />
          </clipPath>
          <clipPath id={rightClipId}>
            <rect x={markerX} y="0" width={width - markerX} height={height} />
          </clipPath>
        </defs>
      )}

      {showRegions && (
        <>
          <g clipPath={`url(#${leftClipId})`}>
            <AreaClosed
              data={points}
              x={(d) => xScale(d.x)}
              y={(d) => yScale(d.y)}
              yScale={yScale}
              curve={curveFn}
              fill={`url(#${gradId})`}
            />
          </g>
          <g clipPath={`url(#${rightClipId})`}>
            <AreaClosed
              data={points}
              x={(d) => xScale(d.x)}
              y={(d) => yScale(d.y)}
              yScale={yScale}
              curve={curveFn}
              fill={`url(#${hatchId})`}
            />
          </g>
        </>
      )}

      {marker && (
        <g>
          <line
            x1={markerX}
            y1={padding}
            x2={markerX}
            y2={height - padding}
            stroke={marker.color ?? 'var(--accent)'}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          {marker.label && (
            <text
              x={markerX}
              y={height - 1}
              textAnchor="middle"
              className={styles.markerLabel}
            >
              {marker.label}
            </text>
          )}
        </g>
      )}

      <LinePath
        data={points}
        x={(d) => xScale(d.x)}
        y={(d) => yScale(d.y)}
        curve={curveFn}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
