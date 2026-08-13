# QA — T-011, round 1 (verify-useragent-r1)

**Overall: PASS (8/8 executable checks green; AC 7 is the critic's judgment —
its evidence is supplied here).**

- Evidence SHA: `0447e6b72643cb2c4f0da6b20367eb984003698d` (HEAD, main)
- Tree: DIRTY — builder's work is uncommitted; exact state pinned in
  `.sagan/ledger/T-011/tree-state.txt` (`git status --short` + `diff --stat`).
- Environment: production servers (`pnpm build` + `next start`), never dev —
  current tree on :3100, baseline `git worktree add … HEAD` on :3101.
  Both servers killed by port and the worktree removed after the run.
- Browser: Playwright Chromium, headless, 1280×900 (375 spot-check).
  Theme pinned per capture (init-script `localStorage.theme` +
  `emulate_media(color_scheme)`) with `data-theme` readback; every capture
  waited for `window.__introDone === true` + 2.5 s settle.
- Persona: `~/.claude/agents/qa/` loaded. Report-only; no source or test
  code touched.

## Per-AC verdicts

### AC 1 — glow behind the experiment, clipped by the frame — PASS

- Woken: `canvas` mounts INSIDE `#dev-overlay`; glow span computed
  `position:absolute; inset:0; z-index:-1`; frame `isolation:isolate;
  overflow:hidden` (`lab-probe.json`).
- Z-order probe: `elementFromPoint` at frame center hits the experiment's
  own `frameHead` div — never the canvas or glow span — in light+dark,
  rest+woken (`hitIsCanvas:false`, `hitInsideGlow:false`, all 7 probes).
- Captures: `lab-{light,dark}-{rest,woken}-frame.png`.

### AC 2 — wake parity with the work tiles — PASS

- Rest: `canvasMounted:false` (WebGL deferred to first wake), glow opacity 0.
- Hover → after 1.8 s: canvas mounted, opacity 1. Leave → after 1.8 s:
  opacity 0, canvas STAYS mounted (flow kept running through fade-out).
- Focus leg executed (adversarial pass): Tab landed on the experiment's
  "Previous" button → canvas mounted, opacity 1; tabbing out → opacity 0
  (`lab-adversarial-probe.json`, `lab-light-focuswake-frame.png`).
- Ease parity, compiled-CSS level: lab `.glow` rule
  `transition:opacity 1s cubic-bezier(.22,1,.36,1)` is byte-equal to the
  work-index `.glow` rule in the shipped chunks.
- "Shader speed drops to 0 at rest": NOT runtime-observable (React prop
  internal). Verified by code inspection of the single shared component
  (`glow.tsx`: `speed={running ? 0.6 : 0}`, `FADE_MS=1000` timer) — listed
  under not_verified for honesty.

### AC 3 — accent radial removed; every fallback reads plain --surface — PASS

- Computed on `.frame`: `background-image: none`,
  `background-color: rgb(245,245,245)` light / `rgb(23,23,23)` dark
  (= `--surface`), in rest, woken, post-leave, reduced-motion and no-JS
  states. Compiled-CSS diff vs HEAD shows the `radial-gradient(...
  var(--accent)...)` declaration deleted, `background:var(--surface)` now.
- Pixel proof: mean RGB of a glow-only strip inside the frame is exactly
  245.0/245.0/245.0 (light) and 23.0/23.0/23.0 (dark) at rest AND
  post-fade — indistinguishable from bare surface.
- No-JS (JS disabled context): no canvas, empty glow span, plain surface.

### AC 4 — one component, work-neutral name; /work renders identically — PASS

- `app/components/glow.tsx` exists (export `Glow`); `work-glow.tsx` deleted;
  `grep -rn "work-glow\|WorkGlow" app/ lib/ tests/` → zero matches (exit 1).
  Importers: `work-tile.tsx`, `work-carousel.tsx`, `app/lab/frame.tsx`.
  (Builder's ambiguity confirmed: only two /work import sites exist — the
  carousel serves both modal and detail seats; "three seats ≠ three files".)
- Prerendered `<main>` extracted from `.next/server/app/{work,work/knav,
  work/perchhq,work/shift}.html`, current build vs HEAD-worktree build:
  **byte-identical, all four pages**.
- Rendered captures, both servers, ephemeral browser contexts:
  `/work` rest light + dark full-page (unmasked), first tile hovered
  (tile media panel masked — animated glow), modal open (carousel canvas
  masked), `/work/knav` full-page (hero canvas masked) — ImageMagick
  `compare -metric AE` = **0 differing pixels on all five pairs**
  (`diff3-*.png`). Masked regions (identical rects both servers, geometry
  probe-matched): tile 136,352→628,751; modal canvas 225,49→1055,568; knav
  hero canvas 225,145→1055,663 — masked because the mesh glow is animated,
  exactly as licensed.
- Mechanics identical on both servers: tile rest no canvas/opacity 0, hover
  canvas+opacity 1, modal opens as `[role=dialog]` at identical geometry.
- Compiled-CSS: the shared /work chunk differs ONLY by an unused Tailwind
  `.leading-base` utility + its `@property` — traced to untracked
  `docs/paper-tokens.md` (Tailwind v4 source-scans the dirty tree; the
  clean worktree lacks the file). No /work element carries that class
  (HTML byte-identical) → zero render effect. Not a T-011 change.

### AC 5 — theme correctness by construction — PASS

- One implementation: `glow.tsx` is the only MeshGradient seat; no lab fork
  (grep). Ramps + `data-theme` MutationObserver live in the shared file.
- Executed live: with the glow woken, flipping `documentElement`
  `data-theme` light→dark kept the canvas mounted and re-rendered the
  ground — glow-strip mean 199.0 → 20.9 (matches the native dark woken
  value 21.5). Captures `lab-themefollow-{before,after}.png`;
  `lab-probe.json → light.themeflip`.

### AC 6 — reduced motion: never mounts, static AC-3 background — PASS

- `emulate_media(reduced_motion='reduce')`, frame hovered 2 s, both themes:
  `canvasMounted:false`, glow `display:none`, frame plain `--surface`
  (`lab-reducedmotion-probe.json`,
  `lab-{light,dark}-reducedmotion-hovered-frame.png`).

### AC 7 — critic criterion (glow reads as ground) — EVIDENCE SUPPLIED

- Judgment belongs to the critic. Evidence: light AND dark, at rest and
  woken (`lab-{light,dark}-{rest,woken}-frame.png`, full-page rest
  `lab-{light,dark}-rest-full.png`). Verify's mechanical observation: the
  woken ground is pure grayscale (strip means R=G=B), sits entirely behind
  the experiment card, and the card's own palette/contrast is untouched
  (z-probe + unchanged card pixels).

### AC 8 — gates green; diff confined — PASS

- `pnpm test` → exit 0, **106/106 pass** (`gate-test.txt`).
- `pnpm exec tsc --noEmit` → exit 0, no output (`gate-typecheck.txt`).
- `pnpm build` → exit 0, all 16 pages generated (`gate-build.txt`).
- Diff confinement (`tree-state.txt`): lab page/module + `frame.tsx` (new
  island), `glow.tsx` (renamed) + importers `work-tile.tsx`/
  `work-carousel.tsx`, `.sagan` process files. Two builder-flagged
  comment-only edits in `work-index.module.scss` /
  `work-carousel.module.scss` (filename refs + one factual shader-name
  fix) — outside AC 8's literal list but provably inert: Sass strips `//`
  comments and the compiled /work CSS is byte-identical (modulo the
  unrelated `.leading-base` artifact above). No tests changed ("any tests"
  read as permissive; see missing test below).

## Adversarial pass (beyond the criteria)

- Keyboard focus wake + blur-out: PASS (see AC 2).
- 375 px `/lab`: `scrollWidth 375 == innerWidth 375`, no horizontal
  overflow; `lab-light-375-rest-frame.png`.
- No-JS static state: PASS (see AC 3).
- Found (environment, not ticket): the persistent automate-browser profile
  served a STALE `/_next/image` derivative (old knav 01, 640×567 vs current
  640×400) for localhost:3100 — `/_next/image` ships immutable cache
  headers, so an image replaced on disk (Aug 12) keeps rendering old
  content in that profile until its cache is cleared. Burned two capture
  rounds before isolation; investigation preserved under
  `superseded-cache-artifact/`. Comparison captures were re-taken in
  ephemeral contexts.
- Found (pre-existing, symmetric on BOTH builds, not T-011): on
  `/work/knav` one visible image never reaches `complete &&
  naturalWidth>0` within 15 s (`knavImgWaitTimeout` in both servers'
  probes). Report-only; worth a look at the detail page's below-fold /
  morph images.

## not_verified

- Shader `speed` prop value at rest (React internal — code-inspected, not
  runtime-observed).
- AC 7's aesthetic judgment (critic's lane; evidence supplied).
- Real-device touch behavior (pointerEnter wake on tap) — not executed.

## The missing test

Nothing pins "the lab frame and the work tile share one glow fade
contract". A compile-snapshot agreement test (lab `.glow` transition
declaration == work-index `.glow` transition declaration, via the existing
sass-compile harness) would have caught a silent fork of the 1s/$ease pair
— exactly the drift AC 2 exists to prevent. Belongs beside the existing
style-donor snapshots in `tests/`.

## Gate-relevant captures (promote preview — show the human these)

- `lab-light-rest-frame.png` / `lab-light-woken-frame.png`
- `lab-dark-rest-frame.png` / `lab-dark-woken-frame.png`
- `lab-light-reducedmotion-hovered-frame.png`
- `work3-cur-rest-light-full.png` vs `work3-base-rest-light-full.png`
  (AE=0 pair proving /work unchanged)

All paths relative to `.sagan/ledger/T-011/`. Everything else in that
directory is working evidence; `superseded-cache-artifact/` documents the
stale-image-cache investigation and supersedes nothing that remains.

## Delta r1.1 — glow-seat hoist + inert `color` deletion (verify-useragent-r1)

**Delta verdict: PASS.** HEAD unchanged at
`0447e6b72643cb2c4f0da6b20367eb984003698d`; amended tree pinned in
`delta-r1.1-tree-state.txt`. Evidence prefixed `delta-r1.1-`. Round-1
compiled chunks preserved under `delta-r1.1-r1-chunks/` BEFORE rebuilding.

### 1. Compiled-CSS claim — PASS (with one precision note)

- **Sass level (exact):** `pnpm exec sass --style=expanded` on the working
  tree vs the same files compiled from a HEAD worktree (valid baseline for
  the two /work modules: their r1 edits were comment-only, proven
  compile-identical to HEAD in round 1):
  - `work-index.module.scss`: diff = exactly one deleted line,
    `color: var(--fg);`. Nothing else.
  - `work-carousel.module.scss`: diff = exactly one deleted line,
    `color: var(--fg);`. Nothing else — which simultaneously proves the
    retired local `$ease` compiles byte-equal to `_motion.scss`'s curve.
  - `lab/page.module.scss` (no pre-amendment compile baseline exists at
    HEAD): expanded `.glow` rule = the r1 shipped declaration set in
    source order, minus `color` — mixin `@if` interleaving preserved
    `opacity` before `pointer-events` as shipped.
- **Shipped-chunk level (cascade-equivalent, not byte-identical):** rule
  extraction from the two changed chunks (`36ea7a6…` → `f61074f…`,
  `ef08bdec…` → `1a851ef…`) shows every delta is (a) `color:var(--fg)`
  deleted from each of the three `__glow` rules and (b) the minifier
  repositioning `width/height/pointer-events` — order-only shifts among
  fully independent properties, no shorthand/longhand crossings →
  **computed-equivalent** (house standard wording; the builder's
  "byte-identical except one line" is exact at the Sass layer, and the
  three untouched chunks ARE byte-identical: `5744c3f2`, `7d2d22d8`,
  `7e6da089` cmp-equal).
- Inertness confirmed at computed level: the glow span's computed `color`
  is `rgb(17,17,17)` after deletion — inherited body color equals the old
  `var(--fg)` resolution, and `glow.tsx` reads token custom properties,
  never `color` (`delta-r1.1-probe.json`).

### 2. Gates — PASS

- `pnpm test` → exit 0, 106/106 (`delta-r1.1-gate-test.txt`).
- `pnpm exec tsc --noEmit` → exit 0 (`delta-r1.1-gate-typecheck.txt`).
- `pnpm build` → exit 0 (`delta-r1.1-gate-build.txt`).

### 3. Render-level proof vs round-1 captures — PASS

Production server (`next start`), ephemeral contexts, `__introDone` +
2.5 s settle, theme pinned light, 1280×900:

- `/work` at rest full-page vs r1 `work3-cur-rest-light-full.png`:
  `compare -metric AE` = **0**.
- `/lab` frame at rest vs r1 `lab-light-rest-frame.png`: AE = 25 px, max
  channel delta **1/255**, all on the frame's border-radius corner arcs —
  antialiasing jitter between the r1 persistent-profile context and the
  ephemeral context, not a style change (`delta-r1.1-diff-lab-rest.png`).
  Glow-strip mean still exactly 245.0 (= `--surface`).
- `/lab` woken (animated — pixel-diff meaningless, stated): canvas mounts,
  opacity 1, transition `opacity 1s cubic-bezier(0.22,1,0.36,1)` unchanged;
  glow-strip mean 199.9 vs r1's 199.7 (frame-to-frame shader variance).
  Capture `delta-r1.1-lab-light-woken-frame.png`.
- Work tile seat probe: rest opacity 0, no canvas, same transition value.

### Delta captures

`delta-r1.1-lab-light-rest-frame.png`,
`delta-r1.1-lab-light-woken-frame.png`,
`delta-r1.1-work-rest-light-full.png` (+ probe JSON and diff images, same
prefix). AC 8's amended diff-confinement holds: the new `_glow.scss`
partial is licensed by the r1.1 Decisions entry; no other source files
entered the diff (`delta-r1.1-tree-state.txt`).
