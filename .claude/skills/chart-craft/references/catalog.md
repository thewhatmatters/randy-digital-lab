# Form catalog

The chart vocabulary, derived from the reference map. Each entry: what it's
*for*, the minimalist treatment, and build status. Only the line chart is built
so far — the rest are specs, built on demand when a note or experiment needs
them. Build new ones to the spec here so the set stays coherent.

When a form isn't listed here, don't improvise a new genre silently — either
adapt the closest entry or add a new spec to this file first.

---

## 1. Line + threshold marker — BUILT

`app/components/charts/line-chart.tsx`

- **For:** a single trend over a continuous range, optionally with one
  threshold called out (e.g. the "60% rule": reliability flat, then rotting
  past a marked point).
- **Treatment:** one `var(--fg)` hairline, `curveMonotoneX` (smooth, no
  overshoot). Optional `marker` = a dashed `var(--accent)` vertical at an x
  value with a mono caps label. No axes.
- **API:** `points={[{x,y}…]}`, `marker={{ at, label?, color? }}`,
  `label="…"` (required, a11y). Prop is `points`, not `data`.

## 2. Bundled-edge flow — spec

- **For:** one source fanning to many destinations (or vice-versa): an offering
  to its surfaces, a platform to its markets. The reference's "Access / Offering",
  "Markets", "Key Services" panels.
- **Treatment:** gentle bezier curves bundled at the source, splaying to
  direct-labeled endpoints. All `var(--muted)` hairlines; if one path matters,
  it (and only it) goes `var(--accent)`. Endpoints labeled in caps mono. No
  nodes/boxes — the curves and labels are the whole diagram.
- **Build notes:** visx `LinePath` per edge with a shared control point near the
  source x; or a single `<path>` per edge with a cubic bezier. Sort endpoints to
  minimize crossings.

## 3. Concentric orbital rings — spec

- **For:** membership/proximity around a center (e.g. actors orbiting a hub at
  different "distances"). The reference's "The Space" panel.
- **Treatment:** thin `var(--muted)` concentric circles, small filled dots
  placed on rings, labels set along/rotated to the ring. Center node labeled
  plainly. No fills, no shading.
- **Build notes:** `@visx/scale` radial/linear for ring radii; place dots by
  (ring, angle). Rotate labels with `transform` to follow the arc.

## 4. Nested pyramid — spec

- **For:** a layered hierarchy or stack of tiers (capabilities building on each
  other). The reference's "The Platform" panel.
- **Treatment:** nested triangles (hairline `var(--muted)`), each tier a tick
  row with a caps-mono label and a short leader line. No fills.
- **Build notes:** pure SVG polylines; compute tier y-bands and the triangle
  edges from a single height. Few enough tiers to hand-place cleanly.

## 5. Proportional circles + stem — spec

- **For:** a ranked set of magnitudes (market sizes, values). The reference's
  "Value by 2021" lollipops.
- **Treatment:** rings (not filled discs) sized by **area** ∝ value, each on a
  thin vertical stem dropping to a value (`var(--fg)`) + caps-mono category
  label (`var(--muted)`). Sort descending. No axis.
- **Build notes:** radius = `k * sqrt(value)` (area-proportional, never radius-
  proportional). `@visx/scale` `scaleSqrt` does this directly.

---

## Adding an entry

A new form earns a catalog entry when it's a genuinely different genre (not a
restyle of an existing one). Write: purpose, minimalist treatment, build notes —
then build it as a token-styled Server Component per `architecture.md`.
