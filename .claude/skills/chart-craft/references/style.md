# Chart style — the visual language

The reference this is grounded in: an AirMap-style ecosystem map — thin gray
hairline curves on warm off-white, tiny uppercase labels, generous whitespace,
no chart chrome at all. The whole vocabulary is restraint. Every rule below
exists to protect that.

## Palette

Monochrome only. There is no categorical color scale here.

| Role | Token | Use |
|------|-------|-----|
| Primary mark (the data) | `var(--fg)` | The main line/curve/shape |
| Secondary / structure | `var(--muted)` | Supporting marks, labels, rings, stems |
| Emphasis (ONE thing) | `var(--accent)` | The single element you're pointing at — a threshold marker, the one highlighted series. Never more than one idea per chart. |
| Field | page background | No chart background, no panel fill |

- **Never hard-code a hex.** Tokens make the chart track light/dark for free
  (light `--fg:#111` / `--accent:#e5484d`; dark `--fg:#ededed` /
  `--accent:#ff6369`).
- Fills are rare — reserve them for genuinely proportional shapes (circle areas).
  Default to stroke, not fill.

## Stroke

- Hairline and **consistent**: ~0.5–1px in viewBox units. Nothing heavy.
- One weight per chart. Don't use weight to encode data — that's what position
  and length are for.
- `stroke-linecap="round"` for organic line work; dashed (`stroke-dasharray="3 3"`)
  only for reference/threshold marks.

## No chrome

Remove everything that isn't data:

- ❌ Axes and axis lines
- ❌ Gridlines
- ❌ Tick marks and tick labels
- ❌ Bounding boxes / panel borders / frames
- ❌ Boxed legends (label the marks directly instead)
- ❌ Drop shadows, gradients-as-decoration, rounded "card" containers

If a viewer needs a number, place it as a floating label next to the mark.

The word that matters is **-as-decoration**. A gradient or fill is allowed when
it *carries meaning* — e.g. the line chart's `regions` treatment shades the two
sides of a threshold marker (a soft gradient for the safe zone, a diagonal hatch
for the degraded "noisy" zone). That's data-ink, not chrome. The test: remove
it — if the chart says less, it earned its place; if it only looks busier, it
was decoration. Stay monochrome and subtle (`var(--fg)`/`var(--muted)`), and
keep the accent reserved for the one thing you're pointing at.

## Typography

- **Micro-labels:** uppercase, letter-spaced, small, light weight,
  `var(--font-mono)`, filled `var(--muted)`. In SVG, `font-size` is in viewBox
  units so it scales with the chart.
- **Section titles** (when a chart group needs a heading): caps + a long
  horizontal rule, matching the existing `.title` / `band` rhythm in
  `global.css`. Don't reinvent heading styles inside charts.
- Sentence-case captions (the one-line "what this shows") live *outside* the
  SVG, in the surrounding `<Margin>` prose — not baked into the chart.

## Layout & whitespace

- Whitespace is the design. Maximal data-ink ratio — when in doubt, remove.
- Charts are responsive: emit `<svg viewBox="0 0 W H">` with `width:100%`,
  `height:auto` so they scale to their container (the margin column or reading
  column). `W`/`H` set *aspect*, not size.
- In notes, a chart sits inside `<Margin>` and inherits that column's width
  (the editorial margin, grid-aligned to cols 9–12). Don't fight the grid.

## Do / Don't

- ✅ One accent element, at most, per chart.
- ✅ Direct-label marks; let position and length carry the data.
- ✅ Smooth, gentle curves (monotone) for line/flow work.
- ❌ No second color "because it's another series" — find another encoding or
  split into small multiples.
- ❌ No heavier stroke for emphasis — use the accent or a label.
- ❌ No chart that only reads in one theme — it must be token-driven.
