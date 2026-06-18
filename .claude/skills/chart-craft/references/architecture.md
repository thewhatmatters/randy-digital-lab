# Chart architecture

How charts are built on randy.digital, and the two hard-won facts that are easy
to re-learn the slow way.

## visx wrappers, not a chart library

Charts are **our own thin components over visx primitives** — `@visx/scale`
(d3 scales), `@visx/shape` (`LinePath`, `Bar`, `AreaClosed`, …), `@visx/curve`
(curve factories). We own the SVG end to end; visx only supplies the math and
path generators.

Why visx over Recharts/Tremor/etc.: those ship *their* chart aesthetic and a
client runtime. visx is unstyled primitives, so there's no look to fight off and
no forced client island. It composes with hand-authored SVG — a visx chart is
the same SVG you'd draw by hand, with geometry computed from data instead of
eyeballed. Install only the modular packages you need (scale/shape/curve), not a
monolith.

## Server Component by default

A static chart is **pure SVG with no browser APIs**, so it renders in the RSC
server pass: zero client JS, prerendered into static HTML. Keep it that way.

Only drop to a `'use client'` island when the chart is genuinely *interactive* —
hover, tooltips, zoom, a lab experiment. That's the only case that ships JS, and
it matches the CLAUDE.md boundary (Server Components by default; client islands
only where interactivity is needed). Import interactive charts via
`dynamic(..., { ssr: false })` per the lab island pattern.

Responsiveness without a client container: emit `<svg viewBox="0 0 W H">` with
`width:100%`, `height:auto`. The viewBox scales to the container; no
`ResponsiveContainer`, no resize observer, no JS.

## Styling: tokens via co-located SCSS module

Per the project CSS convention (the `css-architecture` memory): each chart owns
a co-located `*.module.scss`. Colors and fonts are **design tokens only**
(`var(--fg)`, `var(--accent)`, `var(--muted)`, `var(--font-mono)`), so the chart
tracks light/dark with no per-theme code. `global.css` gets nothing — it's the
Tailwind entry and the shared layer only.

SVG `font-size` set in CSS is in viewBox user units, so labels scale with the
chart just like strokes.

## The blockJS gotcha (required reading)

**Symptom:** an MDX-authored chart throws `Cannot read properties of undefined
(reading 'map')` at prerender; object/array props arrive `undefined` while
string props are fine.

**Cause:** next-mdx-remote v6 runs a `removeJavaScriptExpressions` remark plugin
by default (`blockJS = true`) — a guard against eval'ing arbitrary JS from
*untrusted* MDX. It strips every JS expression attribute (`points={[…]}`,
`marker={{…}}`); only plain string literals (`label="x"`) survive.

**Fix (already applied):** `blockJS: false` in `CustomMDX`'s options in
`app/components/mdx.tsx`. Safe here — every note is first-party content, and
`blockDangerousJS` stays on, so genuinely dangerous calls are still removed
while plain array/object literals pass through. Any chart authored in MDX with
expression props depends on this staying set.

## MDX wiring

1. Build the component in `app/components/charts/<name>.tsx` + `<name>.module.scss`.
2. Import and register it in the `components` map in `app/components/mdx.tsx`.
3. Author it in a note inside `<Margin>` (the editorial margin — see the
   `note-attribution-and-margin` memory), e.g.:

   ```mdx
   <Margin label="The 60% rule">
     <LineChart
       label="…accessible description…"
       marker={{ at: 0.6, label: '60%' }}
       points={[{ x: 0, y: 0.96 }, { x: 1, y: 0.2 }]}
     />
     One-line caption in the margin prose.
   </Margin>
   ```

4. `pnpm build` must prerender it as static; verify visually in both themes.

## Reference implementation

`app/components/charts/line-chart.tsx` is the canonical example: a Server
Component, visx `scaleLinear` + `LinePath` + `curveMonotoneX`, responsive
viewBox, an optional accent `marker`, a required `label` (`role="img"` +
`aria-label`), styled by `line-chart.module.scss` with tokens only. Mirror its
shape for new charts. Prop name is `points` (not `data` — clearer for a chart,
and avoids any `data-*` confusion).
