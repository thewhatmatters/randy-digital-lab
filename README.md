# randy-digital

Personal portfolio site for Randy ([randy@whatmatters.so](mailto:randy@whatmatters.so)).
A rebuild with three pillars:

1. **Portfolio** — landing + (planned) projects index.
2. **Blog** — MDX-authored writing.
3. **Lab** — (planned) interactive "live code explorations" — generative/visual
   experiments in the spirit of [lab01.dev](https://lab01.dev/).

Built on the Vercel **portfolio-starter-kit**, then re-styled to an
**editorial-minimal × technical-monospace** design system and put on a real
Müller-Brockmann grid.

> **Status:** scaffolded and styled. Blog works; the home page is on the grid
> with placeholder content. Projects index and the Lab are not built yet. The
> live working state lives in [`HANDOFF.md`](./HANDOFF.md).

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, React Server Components by default) |
| UI | **React 19** |
| Styling | **Tailwind v4** — CSS-first config; tokens live in `@theme {}` in `app/global.css` |
| Content | local **MDX** files via `next-mdx-remote/rsc` (no CMS) |
| Syntax highlighting | `sugar-high` |
| Fonts | **Geist** Sans + **Geist Mono** (`geist` package) |
| Analytics | Vercel Analytics + Speed Insights |
| Deploy target | Vercel |

Key decisions and the sourced rationale behind them live in `CLAUDE.md` and
`research-portfolio-nextjs-2026.md`. Notably: **no Contentlayer** (stalled) —
if typed/validated frontmatter is needed later, migrate the data layer to
**Velite** without moving the files.

---

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm start      # serve the production build
```

> There is no `lint` script yet. Node 18 is deprecated for Next 16 — use Node 20+.

---

## How content works

This is the part to understand before adding anything. **The blog is
file-based MDX. The portfolio landing is currently hardcoded JSX** (not
markdown — that's a planned change). The Lab will follow the blog's MDX
pattern but doesn't exist yet.

### Blog — add a post by dropping in a file

A blog post **is** a Markdown/MDX file. To publish one, create a new file:

```
app/blog/posts/my-new-post.mdx
```

- **The filename is the URL slug.** `my-new-post.mdx` → `/blog/my-new-post`.
- **The top of the file is frontmatter** (between `---` fences):

  ```mdx
  ---
  title: 'Embracing Vim: The Unsung Hero of Code Editors'
  publishedAt: '2024-04-09'
  summary: 'A short description used for listings, SEO, and the OG image.'
  image: '/optional-social-card.png'   # optional
  ---

  Your post body starts here. Standard Markdown — headings, lists, links,
  code fences (syntax-highlighted), tables — all work.
  ```

  | Field | Required | Notes |
  | --- | --- | --- |
  | `title` | yes | post title + `<title>` tag |
  | `publishedAt` | yes | `YYYY-MM-DD`; used for sorting + display |
  | `summary` | yes | listing/SEO description; feeds the dynamic OG image |
  | `image` | no | social-card image; falls back to a generated `/og` image |

That's the whole workflow — **no registration, no config.** The file appears in
the blog index, gets its own route, and is included in the RSS feed and sitemap
automatically.

#### How it's wired (for maintainers)

- **`app/blog/utils.ts`** — `getBlogPosts()` reads every `.mdx` in
  `app/blog/posts/`, parses the frontmatter, and returns
  `{ metadata, slug, content }` for each. `formatDate()` lives here too.
- **`app/components/posts.tsx`** — `<BlogPosts />` renders the date + title
  list, sorted newest-first. Reused on both the home page and `/blog`.
- **`app/blog/page.tsx`** — the `/blog` index.
- **`app/blog/[slug]/page.tsx`** — the dynamic post route. Looks the post up by
  slug, renders the body through `CustomMDX`, and emits per-post metadata +
  JSON-LD. (`params` is awaited — Next 16 makes it a Promise.)
- **`app/components/mdx.tsx`** — `CustomMDX` (`MDXRemote`) plus the **component
  map**: custom `Table`, links, `next/image`, anchored headings, and
  `sugar-high` code blocks. **This is where Lab interactive islands will
  register** (see below).

### Portfolio (home page)

`app/page.tsx` — currently **hardcoded JSX**: the "My Portfolio" masthead, a bio
paragraph, and a reuse of `<BlogPosts />`. It is placed on the grid (see below)
but its copy is still placeholder. A future pass will replace the copy with
Randy's real content and add a projects index.

### Lab (planned — not built)

Per `CLAUDE.md`, `app/lab/` will mirror `app/blog/`: each experiment is an MDX
file (`app/lab/experiments/*.mdx`) embedding a small **client-island** component
registered in the MDX component map — `Sketch.tsx` (p5.js), `Canvas.tsx`
(react-three-fiber, loaded via `dynamic(..., { ssr: false })`), and an optional
`Playground.tsx` (Sandpack). Pages stay Server Components; interactivity is
quarantined to islands.

---

## Design system & grid

`DESIGN.md` is the **single source of truth** for design (tokens, type, grid,
voice). Those values are **mirrored into the Tailwind `@theme` block in
`app/global.css`** — the two must stay in sync (`/audit-ui` flags drift).

- **Direction:** editorial-minimal × technical-monospace. Restrained,
  type-forward, generous whitespace. Geist **Mono** carries labels, metadata,
  nav, and numbering; near-monochrome + a single **signal red**
  (`#e5484d` light / `#ff6369` dark), used sparingly. System light/dark.
- **Grid (Müller-Brockmann, _app_ profile):** 12 columns, 24px gutter,
  flush-left, **1152px** (`72rem`) desktop container, 8px baseline rhythm.
  Implemented as `@theme` tokens (`--grid-cols`, `--grid-gutter`, `--grid-maxw`,
  `--grid-baseline`, `--leading-base`) driving the `grid-page` + `band`
  (subgrid) utilities. Place children by **column line** with stock Tailwind
  `col-start-*` / `col-end-*`. Page margin is responsive (24 → 48 → 72px).
- **Grid overlay:** press **`g`** anywhere to toggle a column + baseline overlay
  (`app/components/grid-overlay.tsx`, a dev-time client island; ignores
  keypresses while you're typing in a field).

---

## Project structure

```
app/
  layout.tsx              global shell: fonts, nav, footer, grid overlay
  global.css              Tailwind v4 + @theme design tokens + grid utilities
  page.tsx                home / portfolio landing (hardcoded JSX, on the grid)
  blog/
    posts/*.mdx           one file per post  ← add posts here
    page.tsx              /blog index
    [slug]/page.tsx       dynamic post route
    utils.ts              frontmatter parsing + post fetching
  components/
    mdx.tsx               MDX renderer + component map (Lab islands register here)
    nav.tsx, footer.tsx   shell pieces (grid-aligned)
    posts.tsx             the blog post list
    grid-overlay.tsx      `g`-key column + baseline overlay
  og/                     dynamic OG image route
  sitemap.ts, robots, rss feed
DESIGN.md                 design source of truth (tokens ⟷ global.css @theme)
CLAUDE.md                 stack decisions, conventions, skill workflow
HANDOFF.md                current working state / next steps
research-portfolio-nextjs-2026.md   full sourced rationale
docs/sources/             ingested reference material (INDEX.md @-imported by CLAUDE.md)
```

Convention (from `CLAUDE.md`): keep route files in `app/`; pages stay Server
Components; isolate interactivity into small client islands. The target is to
move shared components/hooks/lib **out** of `app/` into top-level `components/`,
`lib/`, `hooks/` — that migration hasn't happened yet (components currently live
in `app/components/`).

---

## Working conventions (skills)

This project leans on installed Claude skills — reach for them by name:

- **`/build-ui`** — implement components/routes following these conventions.
- **`/use-grid-system`** — the column + baseline grid (already applied).
- **`/add-motion`** — animation craft (transform/opacity only, honors
  `prefers-reduced-motion`); delegates specific CSS recipes to
  **`/transitions-dev`**.
- **`/source-ui`** — pull real-world UI references (Mobbin / Refero) for design
  inspiration. _This is the next planned step._
- **`/next-best-practices`** — RSC boundaries, data patterns, metadata, image/font.
- **`/design-md`** — owns the `DESIGN.md` token spec.
- **`/audit-ui`** — a11y + responsive + Core Web Vitals + token-drift pass
  before shipping.

When building UI, read `DESIGN.md` first and map tokens into the Tailwind
`@theme` block.

---

## What's done vs. next

See **[`HANDOFF.md`](./HANDOFF.md)** for the authoritative current state. In
short: scaffold + design system + grid + home-page placement are done and the
blog works. Next up (over the coming days): a `/source-ui` research pass to
pressure-test the design direction, then the real portfolio content, the
projects index, and standing up the Lab.
