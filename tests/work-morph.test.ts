// Cross-language pins for the tile→modal morph contract (T-009) —
// app/components/work-morph.ts is the owner; these tests keep every other
// expression of the contract from drifting away from it. Two families:
//
// 1. Selector-vocabulary scan (the intro-gate idiom): the four morph
//    data-attributes may exist in TS/TSX only as the exported constants —
//    no hand-typed `data-work-*` string may appear anywhere else. Plus a
//    freeze of the constants' literal values: they are shipped DOM
//    vocabulary (verify's capture probes and the rendered HTML depend on
//    them), so renaming is a deliberate, test-visible act.
//
// 2. Geometry pins (the styles-test idiom — compile and compare): the
//    16:10 ratio, the card-frame inset, and the two radii each have one
//    SCSS source; these tests compile the real modules + tiny probes of
//    the partials and assert (a) every consumer got the source's value and
//    (b) the TS px fallbacks in work-morph.ts equal the compiled CSS truth
//    at the default 16px root em — the exact drift that shipped a 6px
//    fallback against an 8px tile radius before this ticket.
//
// Each family has a deliberate-mutation demo failing; transcripts in
// .sagan/ledger/T-009/qabuild/.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'
import {
  WORK_TILE_ATTR,
  WORK_TILE_IMAGE_ATTR,
  WORK_CAROUSEL_ATTR,
  WORK_DETAIL_CONTENT_ATTR,
  WORK_TILE_RADIUS_PX,
  WORK_PANEL_RADIUS_PX,
} from 'app/components/work-morph'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDir, '..')
const componentsDir = path.join(projectRoot, 'app', 'components')
const read = (rel: string) =>
  fs.readFileSync(path.join(projectRoot, rel), 'utf-8')

// ── Family 1: selector vocabulary ────────────────────────────────────────────

describe('morph selector constants (app/components/work-morph.ts)', () => {
  it('freezes the shipped attribute vocabulary', () => {
    // These are rendered DOM bytes and probe vocabulary (verify's capture
    // recipes query them) — a rename must fail here first, on purpose.
    assert.equal(WORK_TILE_ATTR, 'data-work-tile')
    assert.equal(WORK_TILE_IMAGE_ATTR, 'data-work-tile-image')
    assert.equal(WORK_CAROUSEL_ATTR, 'data-work-carousel')
    assert.equal(WORK_DETAIL_CONTENT_ATTR, 'data-work-detail-content')
  })

  it('no hand-typed data-work-* literal outside the module (AC 1 grep)', () => {
    const offenders: string[] = []
    // app/ + lib/ exist today; components/ and hooks/ are named by the
    // project's target structure (CLAUDE.md) — scan them the moment they
    // appear so new islands can't reintroduce literals unnoticed.
    const roots = ['app', 'lib', 'components', 'hooks'].filter((root) =>
      fs.existsSync(path.join(projectRoot, root))
    )
    for (const root of roots) {
      const entries = fs.readdirSync(path.join(projectRoot, root), {
        recursive: true,
        withFileTypes: true,
      })
      for (const entry of entries) {
        if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue
        const abs = path.join(entry.parentPath, entry.name)
        const rel = path.relative(projectRoot, abs)
        if (rel === path.join('app', 'components', 'work-morph.ts')) continue
        // Strip comments so prose mentions of the attributes don't trip the
        // scan — producers attach them via computed spreads and the consumer
        // builds its selectors from the constants, so any remaining match is
        // a hand-typed literal (JSX attribute or selector string).
        const stripped = fs
          .readFileSync(abs, 'utf-8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .split('\n')
          .map((line) => line.replace(/\/\/.*$/, ''))
          .join('\n')
        if (/data-work-/.test(stripped)) offenders.push(rel)
      }
    }
    assert.deepEqual(
      offenders,
      [],
      `morph data-attributes must come from app/components/work-morph.ts; ` +
        `found hand-typed ones in: ${offenders.join(', ')}`
    )
  })
})

// ── Family 2: geometry pins ──────────────────────────────────────────────────

/** Compile a tiny SCSS probe against the shared partials. */
function compileProbe(source: string): string {
  return sass.compileString(source, {
    style: 'expanded',
    loadPaths: [componentsDir],
  }).css
}

/** Extract one declaration's value from a compiled block, by selector. */
function declValue(css: string, selector: string, property: string): string {
  const block = css.match(
    new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`)
  )?.[1]
  assert.ok(block, `selector ${selector} missing from compiled CSS`)
  const value = block.match(
    new RegExp(`(?:^|;|\\s)${property}:\\s*([^;]+);`)
  )?.[1]
  assert.ok(value, `${selector} has no ${property} declaration`)
  return value.trim()
}

/** A compiled CSS length at the default 16px root em, in px. */
function toPx(value: string): number {
  const m = value.match(/^([\d.]+)(rem|px)$/)
  assert.ok(m, `expected a rem/px length, got "${value}"`)
  return m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1])
}

describe('work-media aspect ratio (one source: _work-geometry.scss)', () => {
  const source = declValue(
    compileProbe(
      `@use 'work-geometry' as *;\n.probe { aspect-ratio: $work-aspect-ratio; }`
    ),
    '.probe',
    'aspect-ratio'
  )

  it('is 16:10 — the ratio the morph maths assume', () => {
    assert.equal(source, '16/10')
  })

  it('every compiled aspect-ratio in the work modules is the source value', () => {
    const modules = [
      // [module, expected number of aspect-ratio declarations]
      ['app/components/work-index.module.scss', 2], // .thumb + .arrowLayer
      ['app/components/work-carousel.module.scss', 1], // .carousel
    ] as const
    for (const [rel, count] of modules) {
      const css = sass.compile(path.join(projectRoot, rel), {
        style: 'expanded',
      }).css
      const ratios = (css.match(/aspect-ratio:\s*[^;]+;/g) ?? []).map((decl) =>
        decl.replace(/^aspect-ratio:\s*/, '').replace(/;$/, '').trim()
      )
      assert.equal(
        ratios.length,
        count,
        `${rel}: expected ${count} aspect-ratio declaration(s), found ${ratios.length}`
      )
      for (const ratio of ratios) {
        assert.equal(ratio, source, `${rel} drifted from $work-aspect-ratio`)
      }
    }
  })
})

describe('card frame inset (one source: $card-frame in _card.scss)', () => {
  it('the arrow layer sits at exactly the card-shell padding on all three sides', () => {
    // The layer mirrors the media panel's border box by construction only if
    // its inset equals the frame the shell pads the panel with — this was a
    // hand-copied 0.25rem before T-009 (the T-004 critic's ~1px drift).
    const shell = compileProbe(
      `@use 'card' as *;\n.probe { @include card-shell; }`
    )
    const frame = declValue(shell, '.probe', 'padding')
    const workIndex = sass.compile(
      path.join(componentsDir, 'work-index.module.scss'),
      { style: 'expanded' }
    ).css
    for (const side of ['top', 'left', 'right'] as const) {
      assert.equal(
        declValue(workIndex, '.arrowLayer', side),
        frame,
        `.arrowLayer ${side} drifted from the card-shell frame`
      )
    }
  })
})

describe('morph radius fallbacks agree with CSS truth (the 6-vs-8px lie)', () => {
  it('WORK_TILE_RADIUS_PX == the compiled card-panel radius', () => {
    const panel = compileProbe(
      `@use 'card' as *;\n.probe { @include card-panel; }`
    )
    assert.equal(
      WORK_TILE_RADIUS_PX,
      toPx(declValue(panel, '.probe', 'border-radius')),
      'work-morph.ts tile-radius fallback drifted from $card-panel-radius'
    )
  })

  it('WORK_PANEL_RADIUS_PX == --radius × the modal panel multiplier', () => {
    const radiusToken = read('app/global.css').match(
      /--radius:\s*([\d.]+(?:rem|px))/
    )?.[1]
    assert.ok(radiusToken, '--radius token missing from app/global.css')
    const modal = sass.compile(
      path.join(componentsDir, 'work-modal.module.scss'),
      { style: 'expanded' }
    ).css
    const multiplier = declValue(modal, '.panel', 'border-radius').match(
      /^calc\(var\(--radius\)\s*\*\s*([\d.]+)\)$/
    )?.[1]
    assert.ok(
      multiplier,
      '.panel border-radius is no longer calc(var(--radius) * n) — repin this test to the new form'
    )
    assert.equal(
      WORK_PANEL_RADIUS_PX,
      toPx(radiusToken) * parseFloat(multiplier),
      'work-morph.ts panel-radius fallback drifted from the CSS truth'
    )
  })
})
