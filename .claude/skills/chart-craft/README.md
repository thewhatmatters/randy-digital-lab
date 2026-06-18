# chart-craft

**What it is:** Keep every chart on randy.digital in the site's minimalist,
monochrome, editorial style — built as visx Server-Component wrappers, styled
only with design tokens.

## What you get

- A style contract: the visual rules every chart must follow (monochrome
  hairlines, no chrome, caps mono micro-labels, one accent element).
- An architecture standard: visx wrappers, Server Components, token-only SCSS,
  and the `blockJS: false` MDX requirement — so charts are built consistently.
- A form catalog: line (built), bundled-flow, orbital rings, pyramid,
  proportional circles — each specced so new charts match the set.

## How to run

Say "add a chart to this note", "visualize this data", "build a flow chart",
"is this chart on-style?", or run `/chart-craft`. Reach for it before adding any
figure to a note or lab experiment, when building a new chart type, or to review
an existing one.

## What it needs

Nothing to set up — it's docs-only (no scripts, no secrets). It assumes the
project's visx packages (`@visx/scale`, `@visx/shape`, `@visx/curve`) and the
`blockJS: false` setting in `app/components/mdx.tsx`, both already in the repo.

## How it works (high level)

1. Read the style contract in `SKILL.md` (full spec in `references/style.md`).
2. Pick the right form from `references/catalog.md` (or add a spec for a new one).
3. Build it as a token-styled Server Component per `references/architecture.md`,
   mirroring `app/components/charts/line-chart.tsx`.
4. Wire it into the MDX map and author it inside a note's `<Margin>`.
5. Verify it prerenders static (`pnpm build`) and reads correctly in both themes.

## Where to look next

- `SKILL.md` — operating instructions Claude follows.
- `handoff.md` — design decisions and the "why".
- `references/style.md` — the full visual language.
- `references/catalog.md` — the chart form catalog.
- `references/architecture.md` — visx + RSC + the blockJS gotcha.
