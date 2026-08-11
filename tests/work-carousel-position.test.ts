// Unit pin for the shared carousel position vocabulary (T-004,
// app/components/work-carousel-position.ts). Both functions are pure and
// directive-free by design — the Server-Component modal route and the client
// islands must parse ?i= with identical rules, so this suite is the single
// place the clamping contract is stated executably.
//
// Seam notes:
// - parseIndexParam only lower-bounds (junk/negatives/arrays -> 0); the
//   upper clamp lives in clampIndex, applied where the image count is known.
//   Tests mirror that split — do not "fix" parseIndexParam to clamp high.
// - The ?i= convention is 0-indexed with i=0 elided from URLs: a missing
//   param and an explicit "0" MUST land on the same slide.
// - Float/whitespace/trailing-junk cases pin Number.parseInt(_, 10)
//   semantics on purpose: a future radix or Number() swap changes shared
//   URL behavior and should fail here, not surface as a rendered symptom.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  clampIndex,
  parseIndexParam,
} from 'app/components/work-carousel-position'

describe('parseIndexParam — valid indices', () => {
  it('parses positive integer strings verbatim', () => {
    assert.equal(parseIndexParam('1'), 1)
    assert.equal(parseIndexParam('2'), 2)
    assert.equal(parseIndexParam('12'), 12)
  })

  it('does NOT upper-clamp — out-of-range high values pass through for clampIndex', () => {
    assert.equal(parseIndexParam('99'), 99)
  })
})

describe('parseIndexParam — the i=0 elision convention', () => {
  it('missing param (undefined) is slide 0 — plain /work/[slug] opens at the start', () => {
    assert.equal(parseIndexParam(undefined), 0)
  })

  it('an explicit "0" is also slide 0 — elided and explicit zero agree', () => {
    assert.equal(parseIndexParam('0'), 0)
  })
})

describe('parseIndexParam — junk never crashes, always slide 0 (AC 3)', () => {
  it('non-numeric string ("abc") is 0', () => {
    assert.equal(parseIndexParam('abc'), 0)
  })

  it('empty and whitespace-only strings are 0', () => {
    assert.equal(parseIndexParam(''), 0)
    assert.equal(parseIndexParam('   '), 0)
  })

  it('negative strings are 0 (including "-0")', () => {
    assert.equal(parseIndexParam('-1'), 0)
    assert.equal(parseIndexParam('-5'), 0)
    assert.equal(parseIndexParam('-0'), 0)
  })

  it('non-string values are 0 — repeated params arrive as arrays from Next', () => {
    assert.equal(parseIndexParam(['2', '3']), 0)
    assert.equal(parseIndexParam(2), 0)
    assert.equal(parseIndexParam(null), 0)
    assert.equal(parseIndexParam({}), 0)
  })
})

describe('parseIndexParam — parseInt semantics pinned (radix 10, prefix parse)', () => {
  it('float strings truncate to the integer prefix', () => {
    assert.equal(parseIndexParam('2.9'), 2)
    assert.equal(parseIndexParam('1.0'), 1)
  })

  it('surrounding whitespace is tolerated', () => {
    assert.equal(parseIndexParam('  4  '), 4)
  })

  it('trailing junk after digits is ignored ("3px" -> 3, "1e2" -> 1)', () => {
    assert.equal(parseIndexParam('3px'), 3)
    assert.equal(parseIndexParam('1e2'), 1)
  })
})

describe('clampIndex — bounds into [0, max]', () => {
  it('passes in-range indices through, inclusive of both ends', () => {
    assert.equal(clampIndex(0, 3), 0)
    assert.equal(clampIndex(2, 3), 2)
    assert.equal(clampIndex(3, 3), 3)
  })

  it('clamps out-of-range high to max (i=99 on a 4-image project -> 3)', () => {
    assert.equal(clampIndex(99, 3), 3)
    assert.equal(clampIndex(4, 3), 3)
  })

  it('clamps negatives to 0', () => {
    assert.equal(clampIndex(-1, 3), 0)
    assert.equal(clampIndex(-99, 3), 0)
  })

  it('single-image case (max = 0): everything collapses to 0', () => {
    assert.equal(clampIndex(0, 0), 0)
    assert.equal(clampIndex(5, 0), 0)
    assert.equal(clampIndex(-1, 0), 0)
  })
})
