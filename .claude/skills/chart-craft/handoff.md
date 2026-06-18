# chart-craft — Handoff & decisions

Living record of what this skill is, the decisions behind it, and any
non-obvious constraints (spec A12).

Created: 2026-06-18  ·  Generator: generate-skill @ CC 2.1.181

## 1. Purpose

Keep every chart on randy.digital in the site's minimalist, monochrome,
editorial style — built as visx Server-Component wrappers, styled only with
tokens. Guards against viz *drift* (axis chrome, boxed legends, heavy strokes,
hard-coded colors).

## 2. Reusable patterns (link to spec A1..A13)

Follows `~/.claude/skills/skill-architecture.md` A1–A13. Notable:
- A1 (progressive disclosure): lean `SKILL.md`; full spec/catalog/architecture
  in `references/`.
- A3/A4: docs-only skill — no scripts, no Mode probe needed, no secrets.
- A13: plain-language `README.md`.

## 3. Decision log

- 2026-06-18: scaffolded by generate-skill.
- 2026-06-18: **project-local** (`.claude/skills/`, committed with the repo),
  not global like `build-ui`/`use-grid-system`. Reason: it references this
  project's components (`app/components/charts/`), tokens, and MDX setup —
  same call as the existing project-local `design-token-drift`.
- 2026-06-18: **docs-only / no DESIGN.md.** The skill is a *contract about* how
  charts look; it doesn't itself render styled output. The token source of
  truth is the project's `DESIGN.md` + `global.css`; the skill defers to those
  rather than scaffolding its own (recipe `needs_design` = No).
- 2026-06-18: chose **visx** over Recharts/Tremor — unstyled primitives, no
  forced client runtime, composes with hand SVG. Reference impl shipped:
  `app/components/charts/line-chart.tsx`.
- 2026-06-18: prop is **`points`** (not `data`) — clearer for a chart, avoids
  `data-*` confusion.

## 4. Known limitations / environment caveats

- Only the **line chart** is built; the other four catalog forms are specs,
  built on demand. The skill says so honestly — don't present the set as fully
  implemented.
- Charts depend on **`blockJS: false`** in `app/components/mdx.tsx`. If that
  ever reverts (e.g. a next-mdx-remote major bump changes defaults), MDX-
  authored charts silently lose object/array props. See
  `references/architecture.md`.
- Visual review is manual (screenshots in both themes); there's no automated
  on-style checker. Could grow one later (analogous to `design-token-drift`).

## 5. Audit rubric coverage

Audited ✅ ready (0 critical / 0 important). As a docs-only reference skill,
these §B items are correctly **N/A**: secrets/`.env`, `preflight.py`, Setup
Gates, `--agent`/standard flags, self-contained artifact, Mode probe. The PASS
items it does target: valid frontmatter (`name` + `description` only), lean
body with detail in `references/` (A1), plain-language `README.md` (A13),
honest scope + disclosed limitations (A12), decision log here.

## 6. Notes

Deps: `@visx/scale`, `@visx/shape`, `@visx/curve` (in `package.json`).
Cross-links: memories `mdx-blockjs-and-charts`, `css-architecture`,
`note-attribution-and-margin`; project `DESIGN.md`.
