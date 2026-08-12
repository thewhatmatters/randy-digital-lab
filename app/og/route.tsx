import { ImageResponse } from 'next/og'
import { siteName } from 'lib/site'

// Social card for every page that has no frontmatter image — this site's
// language, not the starter's (T-008). ImageResponse renders in an isolated
// worker that can't read global.css, so the DARK palette tokens are mirrored
// here as static hex — if §7 of global.css changes, re-mirror these:
const BG = '#0a0a0a' //     --bg      (dark)
const FG = '#ededed' //     --fg      (dark)
const MUTED = '#a3a3a3' //  --muted   (dark)
const ACCENT = '#ff6369' // --accent  (dark)

// The card is a fixed 1200×630 raster — no viewport, so no responsive (md:)
// classes; plain style objects keep Satori's supported-CSS surface explicit.
export function GET(request: Request) {
  let url = new URL(request.url)
  let title = url.searchParams.get('title') || siteName

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: BG,
          padding: 80,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 32,
            color: MUTED,
          }}
        >
          {/* The accent tick — the one non-neutral, per the accent-only rule. */}
          <div
            style={{
              width: 14,
              height: 14,
              backgroundColor: ACCENT,
              borderRadius: 3,
            }}
          />
          {siteName}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            color: FG,
          }}
        >
          {title}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
