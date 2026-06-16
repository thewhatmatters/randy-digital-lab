# design-token-drift

**What it is:** Read-only check that the Paper design canvas still matches the canonical code design tokens — reports drift, never writes.

## What you get

- A drift table comparing the six semantic color tokens (light + dark) across
  `app/global.css`, `DESIGN.md`, and the Paper canvas swatches.
- The fix direction for anything that disagrees: **canvas ← code** (code is
  canonical). It names the fix; it does not apply it.

## How to run

Say "check design drift" / "is Paper in sync with the code?" / "verify design
tokens", or `/design-token-drift`. Best before committing a color change, after
editing the accent/palette, or when you reconnect Paper Desktop.

## What it needs

- Nothing for the code side — it parses files headlessly.
- For the canvas side, Paper Desktop must be running with the `randy.digital`
  file open (the Paper MCP is local). If it's not, the canvas side is reported
  as "skipped" and the code checks still run.

## How it works (high level)

1. Parse the light/dark tokens from `app/global.css` and the `DESIGN.md` table;
   flag any code-internal mismatch.
2. If Paper is connected, find the canvas swatches by name and read each one's
   fill and its `--token: value;` declaration.
3. Three-way compare (code vs fill vs declaration), case-insensitive.
4. Print a drift table + verdict. It writes nothing.

## Where to look next

- `SKILL.md` — operating instructions Claude follows.
- `handoff.md` — design decisions and the "why".
- `references/randy-digital-profile.md` — the project-specific bindings (paths,
  selectors, canvas structure); the script logic is generic.
