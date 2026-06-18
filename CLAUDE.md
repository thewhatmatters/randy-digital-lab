# randy-digital

Personal portfolio website for Randy (randy@whatmatters.so). Rebuild of the
existing site. Three pillars: a **portfolio**, a **blog**, and a **lab** of
interactive "live code explorations" (generative/visual experiments in the
spirit of [lab01.dev](https://lab01.dev/)).

> Status: greenfield. Planning + docs done; app not yet scaffolded. See
> `research-portfolio-nextjs-2026.md` for the full sourced rationale behind
> the decisions below.

## Stack & key decisions

- **Framework:** Next.js (App Router) — Server Components by default, client
  islands only where interactivity is needed.
- **Styling:** Tailwind **v4** — CSS-first config. Design tokens live in a
  `@theme {}` block in `app/global.css` and are the single source of truth,
  mirrored from `DESIGN.md`. No `tailwind.config.js` theme object. The code
  here is **canonical**; the Paper design canvas is regenerable documentation
  downstream of it, never authoritative.
- **Component styles:** co-located **SCSS Modules** (`*.module.scss`, `sass`
  dep) next to each component — `import styles from './x.module.scss'`, kebab
  selectors → camelCase locals, nest states/descendants but keep specificity
  equivalent. `app/global.css` stays **plain CSS** (the Tailwind entry — Sass
  would break `@import 'tailwindcss'` + the `@theme`/`@apply`/`@utility` rules)
  and holds ONLY the shared layers: tokens, the `grid-page`/`band` utilities,
  base resets, and the MDX `.prose` typography. **Do not** add component rules
  to `global.css`; give the component a module instead.
- **Content:** local **MDX** files (filesystem + small `utils.ts`), the
  starter's approach. No headless CMS. **Do not adopt Contentlayer** (stalled);
  if typed/validated frontmatter is needed later, migrate the data layer to
  **Velite** without moving the files.
- **Base template:** Vercel **portfolio-starter-kit** — repo `vercel/examples`,
  path `solutions/blog`. Ships MDX/Markdown, SEO (sitemap, robots, JSON-LD),
  RSS, dynamic OG images, syntax highlighting, Tailwind v4, Geist font,
  Speed Insights/Analytics. See `docs/sources/`.
- **Interactivity (the lab):** three client-island wrappers registered as MDX
  components — `Sketch.tsx` (p5.js), `Canvas.tsx` (react-three-fiber, imported
  via `dynamic(..., { ssr: false })`), `Playground.tsx` (Sandpack, optional /
  measure its bundle cost before site-wide use).
- **Data-viz / charts:** minimalist monochrome figures built as our own thin
  **visx** wrappers (`app/components/charts/`), rendered as Server Components
  (pure SVG, zero client JS) and styled with tokens only. Authored in notes
  inside `<Margin>`; supporting text uses `<Caption>`. See **`/chart-craft`**
  for the style contract + the `blockJS: false` MDX requirement.
- **Motion:** layer it — CSS for hover/press, **View Transitions API** for
  route/shared-element changes, **Motion** (independent successor to Framer
  Motion) for interruptible gesture/scroll microinteractions. Always honor
  `prefers-reduced-motion`. Motion components must be `'use client'`.
- **Deploy:** Vercel. Keep Speed Insights + Web Analytics on; watch Core Web
  Vitals.

## Project structure (target)

```
app/
  layout.tsx            global shell: fonts, nav, footer
  global.css            Tailwind v4 + @theme design tokens
  page.tsx              home / portfolio landing
  components/mdx.tsx     MDX renderer + custom component map
  blog/
    posts/*.mdx          one file per post
    [slug]/page.tsx      dynamic post route
    utils.ts             frontmatter + post fetching
  lab/                  mirrors blog/ for interactive experiments
    page.tsx             numbered index (01..N)
    [slug]/page.tsx
    experiments/*.mdx    prose + interactive island embeds
  og/                   dynamic OG image route
  sitemap.ts, robots, rss
components/             shared, non-route components (incl. lab islands)
lib/ , hooks/           shared logic — NOT inside app/
```

Keep route files in `app/`; push reusable components/hooks/lib out of `app/`.
Pages stay Server Components; isolate interactivity into small client islands.

## Working conventions (skills)

This project leans on installed skills — reach for them by name:

- **`/build-ui`** — implement components/routes following the conventions above.
- **`/use-grid-system`** — load-bearing column + baseline grid (Tailwind `@theme`).
- **`/add-motion`** — animation craft; enforces transform/opacity-only +
  reduced-motion guardrails.
- **`/next-best-practices`** — RSC boundaries, data patterns, metadata,
  image/font optimization. Consult before structural decisions.
- **`/design-md`** — owns the `DESIGN.md` token spec.
- **`/audit-ui`** — a11y + responsive + Core Web Vitals + token-drift pass
  before shipping.
- **`/design-token-drift`** — read-only check that the Paper design canvas
  still matches the code tokens; run before committing a token/color change.
- **`/chart-craft`** — style contract for data-viz: minimalist monochrome
  charts as visx Server-Component wrappers (tokens only, no chrome). Use before
  adding any chart/figure to a note or the lab.

`DESIGN.md` is the design source of truth (tokens, type, grid, voice). When
building UI, read it first and map tokens into the Tailwind `@theme` block.

## Commands (after scaffold)

```
pnpm dev        # local dev
pnpm build      # production build
pnpm lint       # lint
```

(Scaffold with: `pnpm create next-app --example
https://github.com/vercel/examples/tree/main/solutions/blog .`)

<!-- ingest-source:start -->
## Ingested sources

Captured source material lives in `docs/sources/`, ingested by the
ingest-source skill. The index below is imported every session; read the
underlying file when a listed source is relevant.

@docs/sources/INDEX.md
<!-- ingest-source:end -->
