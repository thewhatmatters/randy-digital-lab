// The intro reveal state machine, given an owner (T-007). One module holds
// the class vocabulary, the transitions, and the watchdog; everything else
// consumes it.
//
// The machine (classes live on <html>):
//
//   (unarmed)            no-JS / reduced-motion — content renders in place,
//                        none of the gate CSS applies.
//   intro-armed          set BEFORE PAINT by INTRO_ARM_SCRIPT (inlined in
//                        app/layout.tsx — it must run pre-hydration, so it
//                        cannot import; it is generated from this module's
//                        constants at render time instead). Gated sections
//                        collapse to 0fr / hide behind the preloader veil.
//   intro-armed.intro-revealed
//                        the reveal: sections expand and rise in with the
//                        cascade (see app/components/_intro.scss, which owns
//                        the matching selectors — pinned to these constants
//                        by tests/intro-gate.test.ts). Added by the Hero when
//                        its entrance lands, by the preloader on pages with
//                        no hero, or by the watchdog if the intro stalls.
//
// The watchdog exists because the gate is otherwise fail-closed: if either
// GSAP timeline (preloader or hero) ever throws, `intro-revealed` never
// arrives and the page below the hero stays collapsed forever. Failure must
// read as a late entrance, never a blank page.
//
// It runs in two layers, both on the same INTRO_WATCHDOG_MS constant:
//
// 1. Pre-boot deadline (inside INTRO_ARM_SCRIPT): a raw setTimeout armed the
//    moment the gate arms. If the client never takes over (chunk 404 /
//    hydration death), it fires ~4s post-arm: reveals with the normal
//    cascade, hides the veil, marks <html data-intro-watchdog="no-boot">.
//    startIntroWatchdog() clears it when the client boots.
// 2. Silence window (this module): started by the preloader's effect. The
//    intro's timelines pulse it while they tick (introPulse); if
//    INTRO_WATCHDOG_MS passes with no pulse and no reveal, it fires the same
//    reveal with data-intro-watchdog="stalled". A silence window — not a
//    from-arm deadline — because the shipped choreography itself runs longer
//    than 4s end-to-end (veil ~3.9s + hero ~1.6s): a from-arm deadline would
//    fire on every healthy load, while "4s with nothing animating" only ever
//    matches a genuinely stuck intro. While the tab is hidden (rAF paused,
//    GSAP not ticking) the timer defers instead of firing — a paused page is
//    not a stalled one.
//    REQUIREMENT: any future timeline that joins the intro choreography MUST
//    feed this keepalive — introPulse from its onUpdate, plus a milestone
//    pulse at each handoff — because the window reads silence as death: a
//    healthy but mute segment longer than INTRO_WATCHDOG_MS would be
//    "rescued" mid-flight.
//
// This module is directive-free on purpose: app/layout.tsx (a Server
// Component) reads INTRO_ARM_SCRIPT at render time; the client islands
// (preloader.tsx, hero.tsx) call the transitions. Nothing here touches
// `document`/`window` at module scope.

export const INTRO_ARMED = 'intro-armed'
export const INTRO_REVEALED = 'intro-revealed'

/** Diagnosis marker set on <html> by a firing watchdog — never on the happy path. */
export const INTRO_WATCHDOG_ATTR = 'data-intro-watchdog'
/** Marker value: the client never booted; the pre-paint deadline fired. */
export const WATCHDOG_NO_BOOT = 'no-boot'
/** Marker value: the client booted but the intro went silent; this module fired. */
export const WATCHDOG_STALLED = 'stalled'

/** The preloader veil's root attribute — how a firing watchdog clears it. */
export const INTRO_VEIL_ATTR = 'data-intro-veil'

/** The hero island's root attribute (the JSX literal in hero.tsx is pinned to
 * this by tests/intro-gate.test.ts). The preloader's no-hero fallback keys
 * off it, and a firing watchdog uses it to strip the hero's GSAP-owned
 * inline start state (see fire()). */
export const INTRO_HERO_ATTR = 'data-hero'

/** The ONE reduced-motion read, shared by the inline script (via generation)
 * and the client islands (via matchMedia) so the server/client answers can
 * never disagree. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * The watchdog constant (~4s, per the T-007 gate decision). It is BOTH the
 * pre-boot deadline (from arming) and the silence window (from the last
 * animation pulse). 4000ms leaves ≥2.4s of margin over the longest normally
 * silent stretch (the hero leg, ~1.6s scripted — and the hero pulses too, so
 * real silence on a healthy load is frame-scale), while a stuck intro still
 * reveals ~4s after its last sign of life.
 */
export const INTRO_WATCHDOG_MS = 4000

/**
 * The `arm` transition. Inlined by app/layout.tsx so it runs BEFORE first
 * paint (arming after paint would flash the sections, then hide them).
 * Generated from the constants above — the script cannot import at runtime,
 * and generation means its literals cannot drift from the module's.
 * Arms only when JS runs AND motion is allowed; no-JS and reduced-motion
 * loads stay unarmed and render in place.
 */
export const INTRO_ARM_SCRIPT =
  `try{` +
  `if(!matchMedia('${REDUCED_MOTION_QUERY}').matches){` +
  `var d=document.documentElement;` +
  `d.classList.add('${INTRO_ARMED}');` +
  `var f=function(){` +
  `if(document.hidden){window.__introWatchdog=setTimeout(f,${INTRO_WATCHDOG_MS});return}` +
  `d.classList.add('${INTRO_REVEALED}');` +
  `d.setAttribute('${INTRO_WATCHDOG_ATTR}','${WATCHDOG_NO_BOOT}');` +
  `var v=document.querySelector('[${INTRO_VEIL_ATTR}]');` +
  `if(v){v.style.display='none'}` +
  `console.warn('intro-gate: watchdog (${WATCHDOG_NO_BOOT}) — client never took over; revealing without the intro')` +
  `};` +
  `window.__introWatchdog=setTimeout(f,${INTRO_WATCHDOG_MS})` +
  `}` +
  `}catch(e){}`

type PrebootWindow = typeof window & {
  __introWatchdog?: ReturnType<typeof setTimeout>
}

const html = () => document.documentElement

export function isIntroArmed(): boolean {
  return html().classList.contains(INTRO_ARMED)
}

export function isIntroRevealed(): boolean {
  return html().classList.contains(INTRO_REVEALED)
}

// ── The reveal ──────────────────────────────────────────────────────────────

/**
 * The `reveal` transition: sections expand + rise in with the normal cascade
 * (the CSS keys purely off the class, so watchdog reveals and normal reveals
 * are the same entrance). Idempotent; cancels the watchdog.
 */
export function revealIntro(): void {
  cancelIntroWatchdog()
  html().classList.add(INTRO_REVEALED)
}

// ── The watchdog (silence window) ───────────────────────────────────────────

let timer: ReturnType<typeof setTimeout> | null = null
let lastPulseMs = 0

/**
 * Keepalive: the intro's timelines call this while they tick (GSAP onUpdate)
 * and at the veil→hero handoff, restarting the silence window. Cheap on
 * purpose — one timestamp write per frame, no timer churn.
 */
export function introPulse(): void {
  lastPulseMs = Date.now()
}

/**
 * Pure core of the deferred-watchdog timer: how long until the silence
 * window closes. 0 means "fire now"; a positive value means "re-check in
 * this many ms" (a pulse landed inside the window). Extracted pure so the
 * arithmetic is unit-testable without timers.
 */
export function silenceRemaining(
  nowMs: number,
  lastPulseMs: number,
  windowMs: number
): number {
  const silence = nowMs - lastPulseMs
  return silence >= windowMs ? 0 : windowMs - silence
}

/**
 * Start the watchdog. Called from the preloader's effect — the earliest
 * client moment after the gate arms — and takes over from the pre-boot
 * deadline (clears `window.__introWatchdog`). No-op unless the gate is armed
 * and unrevealed. Idempotent: a re-run (dev StrictMode) restarts cleanly.
 */
export function startIntroWatchdog(): void {
  const w = window as PrebootWindow
  if (w.__introWatchdog !== undefined) {
    clearTimeout(w.__introWatchdog)
    delete w.__introWatchdog
  }
  cancelIntroWatchdog()
  if (!isIntroArmed() || isIntroRevealed()) return
  introPulse()
  timer = setTimeout(onTimeout, INTRO_WATCHDOG_MS)
}

export function cancelIntroWatchdog(): void {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

function onTimeout(): void {
  timer = null
  if (isIntroRevealed()) return
  if (document.hidden) {
    // rAF is paused in hidden tabs, so no pulses can arrive — defer judgment
    // until the page is visible again rather than "rescuing" a paused intro.
    timer = setTimeout(onTimeout, INTRO_WATCHDOG_MS)
    return
  }
  const wait = silenceRemaining(Date.now(), lastPulseMs, INTRO_WATCHDOG_MS)
  if (wait > 0) {
    timer = setTimeout(onTimeout, wait)
    return
  }
  fire()
}

function fire(): void {
  html().setAttribute(INTRO_WATCHDOG_ATTR, WATCHDOG_STALLED)
  const veil = document.querySelector<HTMLElement>(`[${INTRO_VEIL_ATTR}]`)
  if (veil) veil.style.display = 'none'
  // The CSS gate only reaches the gated sections; the hero's hidden start
  // state is GSAP-owned INLINE style (headline lines at yPercent 115,
  // bio/CTA/meta at opacity 0 — hero.tsx). Strip inline styles from the
  // hero's descendants so they return to their stylesheet state (visible,
  // in place) — otherwise a stalled reveal would restore the page body
  // around a void where the H1 and the page's sole CTA should be. Only
  // fire() does this; the normal reveal path never touches the hero, so the
  // happy-path choreography still animates from its own gsap.set start
  // state, frame-identical.
  document
    .querySelectorAll<HTMLElement>(`[${INTRO_HERO_ATTR}] [style]`)
    .forEach((el) => el.removeAttribute('style'))
  revealIntro()
  console.warn(
    `intro-gate: watchdog (${WATCHDOG_STALLED}) — no intro progress for ` +
      `${INTRO_WATCHDOG_MS}ms; revealing with the normal cascade. ` +
      `See ${INTRO_WATCHDOG_ATTR} on <html>.`
  )
}
