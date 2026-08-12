// Unit pins for lib/intro-gate.ts (T-007 AC 1/3/7) — the intro reveal state
// machine's owner. Three families:
//
// 1. Cross-boundary pins — the module's constants are consumed in places a
//    type-checker can't see: the pre-paint inline script (generated, but a
//    hand edit could reintroduce literals), the SCSS gate partial, and the
//    preloader's frozen contract strings (`window.__introDone` +
//    `preloader:done`, which verify's capture recipes and the hero's trigger
//    depend on). These tests read those artifacts and pin them to the
//    exported constants so nothing drifts silently. One test automates AC
//    1's grep: no hand-typed `intro-*` string literal may exist in TS/TSX
//    outside the module.
// 2. Pure watchdog arithmetic — silenceRemaining, the deferred-timer core.
// 3. The watchdog machine — mock timers + a stubbed DOM: fires on silence,
//    defers on pulses and hidden tabs, cancels on reveal, no-ops unarmed,
//    takes over the pre-boot handle, and — when it fires — strips the hero's
//    GSAP inline start state so [data-hero] content is visible (while the
//    normal reveal leaves those styles alone).
//
// Test families each have a deliberate-mutation demo failing; transcripts in
// .sagan/ledger/T-007/qabuild/.
import { describe, it, type TestContext } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  INTRO_ARMED,
  INTRO_REVEALED,
  INTRO_WATCHDOG_ATTR,
  INTRO_VEIL_ATTR,
  INTRO_HERO_ATTR,
  INTRO_WATCHDOG_MS,
  INTRO_ARM_SCRIPT,
  REDUCED_MOTION_QUERY,
  WATCHDOG_NO_BOOT,
  WATCHDOG_STALLED,
  silenceRemaining,
  introPulse,
  revealIntro,
  startIntroWatchdog,
  cancelIntroWatchdog,
} from 'lib/intro-gate'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDir, '..')
const read = (rel: string) =>
  fs.readFileSync(path.join(projectRoot, rel), 'utf-8')

// ── Family 1: cross-boundary pins ───────────────────────────────────────────

describe('INTRO_ARM_SCRIPT (the pre-paint arm transition)', () => {
  it('arms, reveals, marks, and clears the veil using the exported constants', () => {
    assert.ok(INTRO_ARM_SCRIPT.includes(`classList.add('${INTRO_ARMED}')`))
    assert.ok(INTRO_ARM_SCRIPT.includes(`classList.add('${INTRO_REVEALED}')`))
    assert.ok(
      INTRO_ARM_SCRIPT.includes(
        `setAttribute('${INTRO_WATCHDOG_ATTR}','${WATCHDOG_NO_BOOT}')`
      )
    )
    assert.ok(INTRO_ARM_SCRIPT.includes(`[${INTRO_VEIL_ATTR}]`))
    assert.ok(INTRO_ARM_SCRIPT.includes(`setTimeout(f,${INTRO_WATCHDOG_MS})`))
  })

  it('arms only inside the reduced-motion guard, wrapped in try/catch', () => {
    const guard = INTRO_ARM_SCRIPT.indexOf(
      `if(!matchMedia('${REDUCED_MOTION_QUERY}').matches)`
    )
    const arm = INTRO_ARM_SCRIPT.indexOf(`classList.add('${INTRO_ARMED}')`)
    assert.ok(guard !== -1, 'reduced-motion guard missing')
    assert.ok(arm > guard, 'arming must sit inside the reduced-motion guard')
    assert.ok(INTRO_ARM_SCRIPT.startsWith('try{'))
    assert.ok(INTRO_ARM_SCRIPT.endsWith('}catch(e){}'))
  })
})

describe('SCSS gate partial pins (app/components/_intro.scss)', () => {
  it('declares the gate selector chains from the module constants', () => {
    const scss = read('app/components/_intro.scss')
    assert.ok(scss.includes(`:global(html.${INTRO_ARMED})`))
    assert.ok(scss.includes(`:global(html.${INTRO_ARMED}.${INTRO_REVEALED})`))
  })

  it('does not resurrect the deleted intro-done class', () => {
    assert.ok(!/intro-done/.test(read('app/components/_intro.scss')))
  })
})

describe('preloader contract pins (app/components/preloader.tsx)', () => {
  const src = read('app/components/preloader.tsx')

  it('keeps the frozen reveal contract byte-for-byte', () => {
    // verify's capture recipes and the hero's trigger depend on these two —
    // T-007 explicitly must not change them.
    assert.ok(src.includes('.__introDone = true'))
    assert.ok(src.includes(`window.dispatchEvent(new Event('preloader:done'))`))
  })

  it('tags the veil root with INTRO_VEIL_ATTR so a firing watchdog can clear it', () => {
    assert.ok(new RegExp(`\\b${INTRO_VEIL_ATTR}\\b`).test(src))
  })

  it('no longer references the deleted intro-done class', () => {
    assert.ok(!/intro-done/.test(src))
  })
})

describe('hero contract pins (app/components/hero.tsx)', () => {
  it('tags its root with INTRO_HERO_ATTR so the no-hero fallback and a firing watchdog can find it', () => {
    // The JSX attribute is a literal (a computed attr name would need a
    // spread and risk the rendered bytes); this pin keeps it from drifting
    // away from the constant the watchdog queries.
    const src = read('app/components/hero.tsx')
    assert.ok(new RegExp(`\\b${INTRO_HERO_ATTR}\\b`).test(src))
  })
})

describe('no hand-typed intro-* literals outside the module (AC 1 grep)', () => {
  it('scans app/ and lib/ TS/TSX for quoted intro-* strings', () => {
    const offenders: string[] = []
    // app/ + lib/ exist today; components/ and hooks/ are named by the
    // project's target structure (CLAUDE.md) — scan them too the moment they
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
        if (rel === path.join('lib', 'intro-gate.ts')) continue
        // Strip comments so prose mentions of the class names don't trip the
        // scan — only quoted string literals count.
        const stripped = fs
          .readFileSync(abs, 'utf-8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .split('\n')
          .map((line) => line.replace(/\/\/.*$/, ''))
          .join('\n')
        if (/['"`]intro-/.test(stripped)) offenders.push(rel)
      }
    }
    assert.deepEqual(
      offenders,
      [],
      `intro-* class literals must come from lib/intro-gate.ts; found hand-typed ones in: ${offenders.join(', ')}`
    )
  })
})

// ── Family 2: pure watchdog arithmetic ──────────────────────────────────────

describe('silenceRemaining (pure deferred-timer core)', () => {
  it('fires exactly at the window boundary', () => {
    assert.equal(silenceRemaining(4000, 0, 4000), 0)
  })

  it('fires when the silence exceeds the window', () => {
    assert.equal(silenceRemaining(9000, 100, 4000), 0)
  })

  it('re-checks with the remainder when a pulse landed inside the window', () => {
    // pulse at 3900, checked at 4000 → 100ms of silence → wait 3900 more
    assert.equal(silenceRemaining(4000, 3900, 4000), 3900)
  })

  it('a fresh pulse restores the full window', () => {
    assert.equal(silenceRemaining(5000, 5000, 4000), 4000)
  })
})

// ── Family 3: the watchdog machine (mock timers + stubbed DOM) ──────────────

/** A [data-hero] descendant double: `style` is the inline style attribute
 * (null = absent, i.e. the element renders from the stylesheet — visible). */
type HeroEl = {
  style: string | null
  removeAttribute: (name: string) => void
}

function heroEl(inlineStyle: string): HeroEl {
  const el: HeroEl = {
    style: inlineStyle,
    removeAttribute: (name) => {
      if (name === 'style') el.style = null
    },
  }
  return el
}

type Stub = {
  classes: Set<string>
  attrs: Map<string, string>
  veil: { style: { display: string } }
  hero: HeroEl[]
  doc: { hidden: boolean }
}

/** Minimal DOM double for the machine — installed on globalThis, removed after. */
function stubDom(
  t: TestContext,
  { armed = true }: { armed?: boolean } = {}
): Stub {
  const classes = new Set<string>(armed ? [INTRO_ARMED] : [])
  const attrs = new Map<string, string>()
  const veil = { style: { display: '' } }
  // The hero's GSAP-hidden start state: inline transform/opacity on
  // [data-hero] descendants — what hero.tsx's gsap.set produces (headline
  // line at yPercent 115; a data-fade block at y 18 / opacity 0).
  const hero = [
    heroEl('translate: none; transform: translate(0%, 115%)'),
    heroEl('opacity: 0; transform: translate(0px, 18px)'),
  ]
  const doc = {
    documentElement: {
      classList: {
        add: (c: string) => classes.add(c),
        contains: (c: string) => classes.has(c),
      },
      setAttribute: (k: string, v: string) => attrs.set(k, v),
    },
    hidden: false,
    querySelector: (sel: string) =>
      sel === `[${INTRO_VEIL_ATTR}]` ? veil : null,
    querySelectorAll: (sel: string) =>
      sel === `[${INTRO_HERO_ATTR}] [style]`
        ? hero.filter((el) => el.style !== null)
        : [],
  }
  const g = globalThis as Record<string, unknown>
  g.document = doc
  g.window = g.window ?? {}
  t.after(() => {
    cancelIntroWatchdog()
    delete g.document
    delete g.window
  })
  return { classes, attrs, veil, hero, doc }
}

describe('intro watchdog machine', () => {
  it('a silent (sabotaged) intro reveals at INTRO_WATCHDOG_MS with the marker, a cleared veil, and a warning', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
    const warn = t.mock.method(console, 'warn', () => {})
    const dom = stubDom(t)

    startIntroWatchdog()
    t.mock.timers.tick(INTRO_WATCHDOG_MS - 1)
    assert.ok(!dom.classes.has(INTRO_REVEALED), 'must not fire early')
    t.mock.timers.tick(1)
    assert.ok(dom.classes.has(INTRO_REVEALED), 'watchdog must reveal')
    assert.equal(dom.attrs.get(INTRO_WATCHDOG_ATTR), WATCHDOG_STALLED)
    assert.equal(dom.veil.style.display, 'none')
    assert.equal(warn.mock.callCount(), 1)
  })

  it('a stalled fire strips the hero start state — [data-hero] descendants render visible, never a void', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
    t.mock.method(console, 'warn', () => {})
    const dom = stubDom(t)

    startIntroWatchdog()
    t.mock.timers.tick(INTRO_WATCHDOG_MS)
    assert.ok(dom.classes.has(INTRO_REVEALED))
    for (const el of dom.hero) {
      // null = inline style attribute removed = the element is back on its
      // stylesheet state (visible, in place) — the CSS gate never owned it.
      assert.equal(
        el.style,
        null,
        'watchdog reveal must strip the GSAP inline start state from hero descendants'
      )
    }
  })

  it('the normal reveal never touches the hero inline styles (happy path stays GSAP-owned)', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
    const warn = t.mock.method(console, 'warn', () => {})
    const dom = stubDom(t)

    startIntroWatchdog()
    t.mock.timers.tick(1000)
    introPulse()
    revealIntro() // the hero's onComplete path
    t.mock.timers.tick(INTRO_WATCHDOG_MS * 3)
    for (const el of dom.hero) {
      assert.notEqual(
        el.style,
        null,
        'revealIntro must leave the hero timeline in charge of its own styles'
      )
    }
    assert.equal(warn.mock.callCount(), 0)
  })

  it('pulses defer the deadline and a normal reveal cancels it — no marker on the happy path', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
    const warn = t.mock.method(console, 'warn', () => {})
    const dom = stubDom(t)

    startIntroWatchdog()
    // the preloader animates for ~3.9s, pulsing as it goes
    t.mock.timers.tick(3900)
    introPulse()
    // the original deadline passes harmlessly (pulse landed inside window)
    t.mock.timers.tick(200)
    assert.ok(!dom.classes.has(INTRO_REVEALED))
    // the hero lands at ~5.5s and reveals normally
    t.mock.timers.tick(1400)
    revealIntro()
    assert.ok(dom.classes.has(INTRO_REVEALED))
    // long after, the watchdog must never have fired
    t.mock.timers.tick(20000)
    assert.equal(dom.attrs.get(INTRO_WATCHDOG_ATTR), undefined)
    assert.equal(warn.mock.callCount(), 0)
  })

  it('revealIntro cancels a pending watchdog outright', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
    const warn = t.mock.method(console, 'warn', () => {})
    const dom = stubDom(t)

    startIntroWatchdog()
    revealIntro()
    t.mock.timers.tick(INTRO_WATCHDOG_MS * 3)
    assert.equal(dom.attrs.get(INTRO_WATCHDOG_ATTR), undefined)
    assert.equal(warn.mock.callCount(), 0)
  })

  it('a hidden tab defers judgment instead of firing (rAF paused is not stalled)', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
    t.mock.method(console, 'warn', () => {})
    const dom = stubDom(t)

    startIntroWatchdog()
    dom.doc.hidden = true
    t.mock.timers.tick(INTRO_WATCHDOG_MS)
    assert.ok(!dom.classes.has(INTRO_REVEALED), 'must not fire while hidden')
    dom.doc.hidden = false
    t.mock.timers.tick(INTRO_WATCHDOG_MS)
    assert.ok(dom.classes.has(INTRO_REVEALED), 'fires after tab is visible again')
  })

  it('start is a no-op when the gate never armed (no-JS / reduced motion)', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
    const warn = t.mock.method(console, 'warn', () => {})
    const dom = stubDom(t, { armed: false })

    startIntroWatchdog()
    t.mock.timers.tick(INTRO_WATCHDOG_MS * 3)
    assert.ok(!dom.classes.has(INTRO_REVEALED))
    assert.equal(dom.attrs.get(INTRO_WATCHDOG_ATTR), undefined)
    assert.equal(warn.mock.callCount(), 0)
  })

  it('start takes over from the pre-boot deadline (clears window.__introWatchdog)', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
    t.mock.method(console, 'warn', () => {})
    stubDom(t)

    let prebootFired = false
    const w = (globalThis as Record<string, unknown>).window as {
      __introWatchdog?: ReturnType<typeof setTimeout>
    }
    w.__introWatchdog = setTimeout(() => {
      prebootFired = true
    }, INTRO_WATCHDOG_MS)

    startIntroWatchdog()
    assert.equal(w.__introWatchdog, undefined, 'pre-boot handle must be cleared')
    t.mock.timers.tick(INTRO_WATCHDOG_MS * 3)
    assert.equal(prebootFired, false, 'pre-boot timer must never fire after handoff')
  })
})
