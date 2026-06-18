import { scaleLinear } from '@visx/scale'
import { LinePath } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
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
  marker,
  label,
}: {
  points: Point[]
  /** viewBox units — the chart scales to its container; this only sets aspect. */
  width?: number
  height?: number
  padding?: number
  stroke?: string
  strokeWidth?: number
  /** A vertical reference line (e.g. the "60%" threshold), accent by default. */
  marker?: { at: number; color?: string; label?: string }
  /** Required: describes the chart for screen readers. */
  label: string
}) {
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

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className={styles.chart}
    >
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
        curve={curveMonotoneX}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
