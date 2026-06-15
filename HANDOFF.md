# Handoff — randy-digital

_Updated 2026-06-14 · session: first real note ("Building Conan") + its
editorial polish, a grid-bound note layout with a right rail + CTA, a shared
Button component, and the 60%-rule source ingested._

## Goal

Rebuild Randy's personal site (Next.js 16 App Router + Tailwind v4) with three
pillars: **portfolio**, **MDX notes**, and a **lab** of interactive experiments.
Built on the Vercel portfolio-starter-kit; leans on skills (`/build-ui`,
`/use-grid-system`, `/add-motion`, `/source-ui`, `/next-best-practices`,
`/audit-ui`, `/ingest-source`, `/handoff`).

This session was almost entirely about shipping the **first note** and making
the note reading experience feel editorial.

## Current state

Dev server runs clean at `localhost:3000` (Turbopack, fresh process this
session — see "gotcha" below). `npx tsc --noEmit` clean throughout. Everything
below verified live via headless Playwright (`automate-browser`).

### Done & verified this session

- **First note: `app/notes/posts/building-conan.mdx`** — "Dashboard
  Confessional: I built one I'd actually want to stare at". Heavy voice/content
  iteration with Randy. Final arc (4 sections): intro (nothing good to *look at*
  → the itch) → "I wanted something I'd actually want to look at" (honest
  dashboard-love confession — this is the heart) → "A 'simple' app is never
  simple" (the Remotion launch-video story) → "Did watching it actually change
  anything?" (the 60% rule) → "Today it's on Product Hunt". ~525 words.
  - **Voice = fun + honest** (per `DESIGN.md` ## Voice). Removed earlier
    inauthentic/techy framings: the whole "Payments & licensing" section, the
    "spec not code / not a dashboard to stare at" angle (Randy *likes*
    dashboards), and a "test with real money" bug section.
  - **Remotion accuracy**: Remotion is its own framework (linked →
    remotion.dev), NOT a Claude skill. The *skill* is the playbook Randy wrote
    so Claude Code drives Remotion well. Keep these distinct.
  - **60% rule** = context rot / gradual degradation, **not** a hard wall/crash
    (Randy's correction). Linked → the source YouTube video.
  - **Links**: intro "Conan" → conan.sh; rail CTA "↗ conan.sh" → conan.sh;
    closing "come see" → Product Hunt (`producthunt.com/products/conan`);
    "60% rule" → youtube; "Remotion" → remotion.dev.
  - Frontmatter `stack` rail rows (final): `Desktop: Tauri · Rust · React ·
    Tailwind`, `Marketing: Astro · Vercel · Remotion · Resend`. (UI→Desktop
    rename so Tauri/Rust make sense; Licensing/KV row removed at Randy's req.)
- **Note layout — grid + right rail** (`app/notes/[slug]/page.tsx`): article +
  a subgrid `band`; article at `md:col-end-8` (cols 1–7), a sticky `<aside>`
  rail at `md:col-start-9 md:col-end-13` (col 8 = breathing gap) — mirrors the
  Lab spec sidebar exactly. Rail reuses `.lab-meta__rows`. Rail renders only
  when a post has `stack` or `ctaHref`. **Title splits on `": "`** so
  "Lead: subtitle" titles stack (lead on its own `block` line); titles without
  a colon render normally.
- **Frontmatter parser extended** (`app/notes/utils.ts`): now supports an
  indented YAML-style `stack:` list (`- Label: value`) + flat `ctaLabel` /
  `ctaHref`. Backward-compatible with flat frontmatter. NOTE: this is a custom
  hand-rolled parser, NOT real YAML — use straight outer quotes; a curly `'`
  inside is fine, but YAML-style `''` escaping renders literally.
- **Shared `Button` component** (`app/components/button.tsx`): polymorphic
  (`<a>` if `href`, else `<button>`), `variant` default|accent, **icon always
  leading (left)**, auto `target=_blank rel=noopener` for absolute URLs.
  `CopyPrompt` (lab) and the note rail CTA both route through it. CSS
  consolidated into `.btn` / `.btn--default` / `.btn--accent` / `.btn__icon`
  (replaced old `.lab-copy` + `.note-cta`).
- **Notes index** (`app/components/posts.tsx`): date column is mono, muted,
  one line (`font-mono text-sm text-muted w-[150px] whitespace-nowrap`),
  baseline-aligned with the title (`md:items-baseline`).
- **Removed 3 template placeholder posts** (vim, spaces-vs-tabs, static-typing)
  — they were never ours.
- **Editorial typography (kept)**: `remark-smartypants` (new dep) wired into
  `CustomMDX` options (`app/components/mdx.tsx`) → curly quotes/apostrophes,
  real em/en dashes, ellipses; skips code. Plus CSS: `text-wrap: pretty` on
  `.prose p`/`li` (widow/orphan control), `text-wrap: balance` on prose
  headings + `.title`, `hanging-punctuation: first last` + `optimizeLegibility`
  on `.prose`. `.prose p` uses the `--fg` token (was hardcoded neutral-800).
- **Editorial typography (REVERTED — do not re-add)**: a serif reading face
  (Newsreader/Georgia) for body + a drop cap. Randy explicitly rejected both
  ("that ugliness"). Body stays **Geist Sans**. Don't reintroduce.
- **Source ingested**: `docs/sources/the-60-rule-stopping-context-rot-dylan-davis.md`
  (+ INDEX.md line) — the "60% rule" rationale (context rot, warning signs,
  handoff/compaction tactics). CLAUDE.md already `@`-imports the index.

## Next steps

1. **Voice on notes** (Randy's stated next goal): add a spoken/voice version
   per note. See `docs/ideas.md` #1 (`voice:`/`audio:` frontmatter + a mono
   player island). Decide real voice vs TTS. The rail/frontmatter pattern is a
   natural home for a `voice:`/`audio:` field; the `Button` + rail components
   are ready to host a player control.
2. **Confirm real domain** — `baseUrl = https://randy.digital` is assumed
   (`app/sitemap.ts`); affects canonical/OG/sitemap. Verify before deploy.
3. **Build the portfolio/projects index** (home `/base` masthead/bio is an
   honest draft).
4. **More lab experiments + island wrappers** (Sketch/Canvas/Playground per
   CLAUDE.md target; none built yet).
5. **Motion pass** (`/add-motion`) → **`/audit-ui`** (a11y, token drift, CWV) →
   deploy. Token-drift note: `.prose pre`/`code`/`.anchor` still use hardcoded
   `neutral-*` (code chrome) — audit-ui will flag; fine to leave for that pass.

## Open questions / risks

- **No git remote / nothing committed** — entire site rebuild is uncommitted on
  `main` (see Git state). The starter's `/blog` → `/notes` rename is staged as
  git renames. Old `/blog/*` URLs 404 (add a redirect pre-deploy if any were
  shared).
- **Turbopack stale-CSS gotcha (hit this session)**: after editing
  `app/global.css`, the dev server stopped recompiling the CSS chunk (served
  stale `text-wrap: balance` after source was `pretty`; same chunk hash, no
  recompile in log). Fix that worked: `pkill -f "next dev"`, `rm -rf
  .next/cache`, restart `pnpm dev`. If a CSS edit isn't reflected, suspect this.
- **Component location**: CLAUDE.md targets top-level `components/`; everything
  still lives in `app/components/` (button, copy-prompt, command-bar,
  dev-overlay, grid-overlay). Migration still deferred.
- **`DESIGN.md` was NOT updated** for the typography work — a draft edit to its
  ## Typography table was attempted then abandoned when the serif was reverted.
  DESIGN.md still says "Geist Sans for body" which is correct again. If you
  formalize conventions (smart-quotes/widow-control, the rail/CTA pattern,
  "lead with the defining tool" tag ordering), do it via `/design-md`.
- Internal symbols `getBlogPosts` / `BlogPosts` kept (not user-visible).

## Key decisions (and why)

- **Note title color = `--fg`, body copy = `--fg`** (not `--muted`). Per
  DESIGN.md: muted is metadata/labels only; body is primary text. Rail labels =
  muted, rail values = fg (matches Lab).
- **Tag ordering in rail = main-thing-first, NOT alphabetical** — matches the
  Lab convention (significance order), and alphabetizing would bury `Tauri`.
  Lead with the defining tool, then by role.
- **Right rail starts at col 9 with col 8 as a gap** — consistency with the Lab.
- **Serif body + drop cap rejected** — Randy wants the clean Geist Sans look;
  editorial polish lives in invisible wins (smart quotes, widow control), not
  decorative type. Do not re-add serif/drop cap.
- **Keep `remark-smartypants`** — Randy was fine with curly quotes (the only
  typography change that stayed); it doesn't alter the visual texture.

## Key files

- `app/notes/posts/building-conan.mdx` — the note (content + `stack`/`cta`
  frontmatter).
- `app/notes/[slug]/page.tsx` — note layout: band + sticky rail + CTA + title
  colon-split.
- `app/notes/utils.ts` — custom frontmatter parser (stack list + cta fields).
- `app/components/button.tsx` — shared Button (new).
- `app/components/mdx.tsx` — MDXRemote + smartypants remark plugin.
- `app/components/posts.tsx` — notes index list (mono date).
- `app/global.css` — `.btn*`, `.note-aside*`, `.prose` typography, `.title`
  text-wrap, grid tokens.
- `docs/sources/the-60-rule-stopping-context-rot-dylan-davis.md` — ingested.
- `docs/ideas.md` — idea backlog (#1 = voice notes, the stated next goal).

## Git state

Branch: `main`. **Uncommitted** (no remote). Notable:
- New: `app/notes/posts/building-conan.mdx`, `app/components/button.tsx`,
  `docs/sources/the-60-rule-stopping-context-rot-dylan-davis.md`, `.claude/`,
  `app/lab/`, other `app/components/*` (command-bar, copy-prompt, dev-overlay,
  grid-overlay).
- Modified: `app/global.css`, `app/layout.tsx`, `app/components/mdx.tsx`,
  `app/components/posts.tsx`, `app/notes/utils.ts`, `package.json` +
  `pnpm-lock.yaml` (remark-smartypants added), `docs/sources/INDEX.md`, others.
- Renames (staged): `app/blog/**` → `app/notes/**` (incl. deletion of the 3
  placeholder posts).
