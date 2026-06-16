# design-token-drift — Handoff & decisions

Living record of what this skill is, the decisions behind it, and any
non-obvious constraints (spec A12).

Created: 2026-06-16  ·  Generator: generate-skill @ CC 2.1.145

## 1. Purpose
Read-only check that the Paper design canvas still matches the canonical code
design tokens — reports drift, never writes.

## 2. Reusable patterns (link to spec A1..A13)
Follows `~/.claude/skills/skill-architecture.md` A1–A13. Notable:
- A1 progressive disclosure: project bindings live in
  `references/randy-digital-profile.md`, not the SKILL body.
- A4 scripts: `parse_tokens.py` = JSON stdout / human board stderr / graceful
  failure / exit 0 (read-only).

## 3. Decision log
- 2026-06-16: scaffolded by generate-skill.
- Code is the **single source of truth**; the Paper canvas is regenerable
  documentation downstream. Fix direction is always **canvas ← code**. (Chosen
  over a bidirectional syncer to avoid two unbound sources of truth — the cause
  of an earlier magenta/red accent drift.)
- **Strictly read-only.** A drift *detector*, not a syncer. No code/canvas edits.
- **Generic core + project profile.** CSS-token parsing is generic; randy-digital
  paths/selectors/canvas structure live in the profile so the skill can graduate
  to user-level later.
- Built as a **checker, not a hook/CI gate**, because the Paper MCP is local-only
  (connects only when Paper Desktop is open) — it cannot run headless in CI.

## 4. Known limitations / environment caveats
- Canvas side needs Paper Desktop open with the `randy.digital` file (local MCP).
  Without it, only the code-side (css↔doc) checks run.
- v1 = the six color tokens × light/dark only.
- Each canvas swatch stores its value twice (fill + declaration) with no binding;
  the skill checks both but cannot enforce they stay equal — it only reports.

## 5. Audit rubric coverage
See `skill-architecture.md` §B; targets every applicable PASS.

## 6. Notes
Future extensions (not built): typography scale, spacing/radius tokens,
component-structure parity. Extend `parse_tokens.py` + the profile.
Composes with the Paper MCP (`plugin:paper-desktop:paper`); distinct from
`audit-ui` (a11y/CWV/responsive).
