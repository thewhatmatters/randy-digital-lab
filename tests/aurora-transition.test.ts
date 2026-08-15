// Cross-language pins for the aurora gesture (T-012). The riser is one
// definition with two seats — the shipped route transition
// (app/components/aurora-sweep.tsx) and lab experiment 02
// (app/components/aurora-transition.tsx) — and "one definition" is exactly the
// kind of claim that decays silently. Four families, all in the house idioms:
//
// 1. Timing agreement (the work-morph "TS fallback == CSS truth" idiom):
//    RISE_MS and RISE_PUSH_AT are scheduled in TS but baked into the module's
//    keyframes; the two expressions of each must stay equal. RISE_PUSH_AT has
//    THREE expressions (the constant, the grow phase's duration multiplier and
//    the travel keyframe's hold stop) and all three are pinned.
// 2. Skin agreement (the styles-test compile-and-compare idiom): the riser and
//    the footer bloom must emit the same bar gradient, byte for byte, because
//    both include the one mixin in _aurora.scss. Forks by REPLACEMENT (the
//    mixin's value edited) and by OVERRIDE (the mixin's value kept, then beaten
//    by a second declaration) both fail it — see bgDecls.
// 3. Arc vocabulary (the work-morph selector-scan idiom): the twelve bar
//    heights may exist in TS/TSX only inside app/components/aurora-bars.ts.
// 4. AC 5 (the variant left production): aurora-sweep.tsx keeps exactly one
//    gesture, and its compiled module carries no band.
// 5. AC 2, both seats (added r1.1): the route seat AND the lab seat render the
//    shared riser and neither declares a local one. "One definition, two seats"
//    needs an assertion per seat; one seat pinned is half a claim.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'
import { AURORA_BARS } from 'app/components/aurora-bars'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDir, '..')
const componentsDir = path.join(projectRoot, 'app', 'components')

const compile = (rel: string) =>
  sass.compile(path.join(projectRoot, rel), { style: 'expanded' }).css

const read = (rel: string) => fs.readFileSync(path.join(projectRoot, rel), 'utf8')

/** Source with its comments removed. Prose that names a symbol (and every file
 *  here opens with prose that does) is not a USE of it. */
const stripComments = (src: string) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n')

const RISER_COMPONENT = 'app/components/aurora-riser.tsx'
const RISER_MODULE = 'app/components/aurora-riser.module.scss'
const SEAT_MODULE = 'app/components/aurora-sweep.module.scss'
const SEAT_COMPONENT = 'app/components/aurora-sweep.tsx'
const LAB_COMPONENT = 'app/components/aurora-transition.tsx'
const LAB_MODULE = 'app/components/aurora-transition.module.scss'

/**
 * Read an exported numeric constant out of a .tsx module, by name.
 *
 * The riser is a .tsx that imports a stylesheet, and the test runner's resolve
 * hook (tests/resolve-ts.mjs) handles bare .ts only — so these constants are
 * read from source rather than imported. The pin is the same either way: a
 * changed number fails the comparison, and a changed DECLARATION FORM fails
 * here with a message that says to repin.
 */
function exportedNumber(rel: string, name: string): number {
  const match = read(rel).match(
    new RegExp(`export const ${name} = (-?[\\d.]+)\\b`)
  )
  assert.ok(
    match,
    `${rel} no longer declares "export const ${name} = <number>" — ` +
      `repin this test to the new form`
  )
  return Number(match[1])
}

const RISE_MS = exportedNumber(RISER_COMPONENT, 'RISE_MS')
const RISE_PUSH_AT = exportedNumber(RISER_COMPONENT, 'RISE_PUSH_AT')

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

// ── Family 1: the run's timing, in TS and in the keyframes ───────────────────

describe('rise timing agreement (aurora-riser.tsx vs aurora-riser.module.scss)', () => {
  const css = compile(RISER_MODULE)

  it('RISE_MS equals the module’s own duration fallback', () => {
    // The component always sets --rise-ms, so the fallback is what the CSS
    // believes the run is. If they disagree, one of them is a lie.
    const fallbacks = (css.match(/var\(--rise-ms,\s*\d+ms\)/g) ?? []).map(
      (decl) => Number(decl.match(/(\d+)ms/)![1])
    )
    assert.ok(
      fallbacks.length >= 2,
      `expected the riser module to fall back on --rise-ms at least twice ` +
        `(panel travel + bar growth), found ${fallbacks.length}`
    )
    for (const fallback of fallbacks) {
      assert.equal(
        fallback,
        RISE_MS,
        'aurora-riser.module.scss fell out of step with RISE_MS'
      )
    }
  })

  it('RISE_PUSH_AT equals the grow phase AND the travel keyframe’s hold stop', () => {
    // Expression 2: the bars finish growing at the push.
    const grow = declValue(css, '.riserBar', 'animation')
    const growFraction = grow.match(/var\(--rise-ms,[^)]*\)\s*\*\s*([\d.]+)\)/)?.[1]
    assert.ok(
      growFraction,
      `.riserBar animation is no longer calc(var(--rise-ms, …) * n) — ` +
        `repin this test to the new form (got: ${grow})`
    )
    assert.equal(
      Number(growFraction),
      RISE_PUSH_AT,
      'the bar growth no longer ends where RISE_PUSH_AT says the page swaps'
    )

    // Expression 3: the panel holds still until the push, then travels.
    const hold = css.match(/@keyframes aurora-rise\s*\{\s*0%,\s*([\d.]+)%/)?.[1]
    assert.ok(
      hold,
      'the aurora-rise keyframes no longer open with a "0%, n%" hold — repin this test'
    )
    assert.equal(
      Number(hold) / 100,
      RISE_PUSH_AT,
      'the panel starts travelling at a different moment than RISE_PUSH_AT'
    )
  })
})

/**
 * EVERY background that lands on `selector`, anywhere in a compiled stylesheet
 * — same block or a later one, shorthand or longhand, top level or inside an
 * at-rule — in source order.
 *
 * Why not declValue() for the skin claim: it reads the first match in the first
 * matching block, which catches a fork by REPLACEMENT (someone edits the value
 * the mixin emitted) but not by OVERRIDE (someone keeps the mixin and adds
 * `background-image: …` after it, or a second rule that beats it). Both fork
 * the skin equally, so the assertion is on the whole list: exactly one
 * declaration, and it is the mixin's.
 */
function bgDecls(css: string, selector: string): string[] {
  const cls = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const targets = new RegExp(`(?<![\\w-])${cls}(?![\\w-])`)
  const found: string[] = []
  // Blocks with no nested braces — in expanded output that is every rule,
  // including the ones inside @media/@supports. exec loops rather than
  // matchAll: this tsconfig targets es5 without downlevelIteration.
  const rules = /([^{}]+)\{([^{}]*)\}/g
  let rule: RegExpExecArray | null
  while ((rule = rules.exec(css))) {
    if (!targets.test(rule[1])) continue
    const decls = /(?:^|;|\s)background(?:-image|-color)?:\s*([^;]+);/g
    let decl: RegExpExecArray | null
    while ((decl = decls.exec(rule[2]))) found.push(decl[1].trim())
  }
  return found
}

// ── Family 2: one skin, two surfaces ─────────────────────────────────────────

describe('bar spectrum is one definition (_aurora.scss), not two', () => {
  it('the riser and the footer bloom emit the same gradient as the mixin', () => {
    const mixin = declValue(
      sass.compileString(`@use 'aurora' as *;\n.probe { @include aurora-bar; }`, {
        style: 'expanded',
        loadPaths: [componentsDir],
      }).css,
      '.probe',
      'background'
    )
    assert.ok(
      mixin.includes('--aurora-1') && mixin.includes('--aurora-6'),
      `the aurora-bar mixin no longer emits the full token spectrum: ${mixin}`
    )
    // One declaration each, and it is the mixin's: a changed value fails on the
    // value, an added override fails on the count.
    assert.deepEqual(
      bgDecls(compile(RISER_MODULE), '.riserBar'),
      [mixin],
      'the route/lab riser drifted from the shared bar skin — either the ' +
        'gradient was edited, or a second background declaration now paints ' +
        'over the mixin'
    )
    assert.deepEqual(
      bgDecls(compile('app/components/footer-reveal.module.scss'), '.bar'),
      [mixin],
      'the footer bloom drifted from the shared bar skin — either the ' +
        'gradient was edited, or a second background declaration now paints ' +
        'over the mixin'
    )
  })
})

// ── Family 3: the arc lives in exactly one module ────────────────────────────

describe('the bar arc (app/components/aurora-bars.ts) is never restated', () => {
  it('no other TS/TSX file carries the arc as a literal', () => {
    const needle = AURORA_BARS.slice(0, 4).join(',\\s*')
    const pattern = new RegExp(needle)
    const offenders: string[] = []
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
        if (rel === path.join('app', 'components', 'aurora-bars.ts')) continue
        // Strip comments: the lab's copy prompt quotes the arc on purpose (it
        // is a build spec for someone with no access to this repo), and prose
        // that mentions it is not a second source either. What must not exist
        // is a second array feeding a second renderer.
        const stripped = fs
          .readFileSync(abs, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .split('\n')
          .map((line) => line.replace(/\/\/.*$/, ''))
          .join('\n')
          .replace(/`(?:[^`\\]|\\[\s\S])*`/g, '``')
        if (pattern.test(stripped)) offenders.push(rel)
      }
    }
    assert.deepEqual(
      offenders,
      [],
      `the bar arc must come from app/components/aurora-bars.ts; ` +
        `found it restated in: ${offenders.join(', ')}`
    )
  })
})

// ── Family 4: the sweep variant left production (AC 5) ───────────────────────

describe('the route seat keeps exactly one gesture (T-012 AC 5)', () => {
  it('aurora-sweep.tsx has no gesture switch left', () => {
    const source = read(SEAT_COMPONENT)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .map((line) => line.replace(/\/\/.*$/, ''))
      .join('\n')
    assert.ok(
      !/\bGESTURE\b/.test(source),
      'the GESTURE constant is back in the shipped transition'
    )
    assert.ok(
      !/'sweep'|"sweep"/.test(source),
      'a sweep branch is back in the shipped transition'
    )
  })

  it('the route seat’s module carries no band, and the lab’s does', () => {
    const seat = compile(SEAT_MODULE)
    for (const selector of ['.band', '.step', '.forward', '.back']) {
      assert.ok(
        !seat.includes(`${selector} `) && !seat.includes(`${selector},`),
        `${SEAT_MODULE} still emits ${selector} — the variant did not leave production`
      )
    }
    const lab = compile(LAB_MODULE)
    assert.ok(
      lab.includes('.band'),
      'the sweep variant did not survive in the lab experiment'
    )
  })

  it('the lab’s band duration agrees between its TS and its CSS', () => {
    const ms = Number(read(LAB_COMPONENT).match(/const BAND_MS = (\d+)/)?.[1])
    assert.ok(
      Number.isFinite(ms),
      `${LAB_COMPONENT} no longer declares "const BAND_MS = <number>" — repin this test`
    )
    const fallbacks = (
      compile(LAB_MODULE).match(/var\(--band-ms,\s*\d+ms\)/g) ?? []
    ).map((decl) => Number(decl.match(/(\d+)ms/)![1]))
    assert.ok(
      fallbacks.length > 0,
      `${LAB_MODULE} no longer falls back on --band-ms — repin this test`
    )
    for (const fallback of fallbacks) {
      assert.equal(fallback, ms, 'the sweep band fell out of step with BAND_MS')
    }
  })

  it('the shipped seat renders the shared riser, not a local one', () => {
    const source = stripComments(read(SEAT_COMPONENT))
    assert.match(
      source,
      /from '\.\/aurora-riser'/,
      'aurora-sweep.tsx no longer imports the shared riser'
    )
    assert.match(
      source,
      /<AuroraRiser\b/,
      'aurora-sweep.tsx imports the shared riser but no longer renders it'
    )
    assert.ok(
      !compile(SEAT_MODULE).includes('.riser'),
      `${SEAT_MODULE} declares its own riser again — the seat should only place it`
    )
  })
})

// ── Family 5: two seats, both pinned (T-012 AC 2) ────────────────────────────

// The lab seat's half of the same claim. Added in r1.1 because the route seat
// carried the only assertion: deleting <AuroraRiser /> from the lab experiment
// left the whole suite green, so "one definition, two seats" was pinned at one
// seat. An import alone is not evidence of use (an unused import typechecks),
// so the element itself is what is asserted.
describe('the lab seat renders the shared riser too (T-012 AC 2)', () => {
  it('aurora-transition.tsx places AuroraRiser and declares no riser of its own', () => {
    const source = stripComments(read(LAB_COMPONENT))
    assert.match(
      source,
      /from '\.\/aurora-riser'/,
      'aurora-transition.tsx no longer imports the shared riser — lab ' +
        'experiment 02 has stopped demonstrating the shipped gesture'
    )
    assert.match(
      source,
      /<AuroraRiser\b/,
      'aurora-transition.tsx imports the shared riser but no longer renders ' +
        'it — the lab seat is empty or has grown its own rise'
    )
    assert.ok(
      !compile(LAB_MODULE).includes('.riser'),
      `${LAB_MODULE} declares its own riser — the lab seat should only place ` +
        `the shared one (aurora-riser.module.scss owns the geometry)`
    )
  })
})
