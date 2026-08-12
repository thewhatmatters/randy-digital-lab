// Unit pin for lib/dates.ts (T-005 AC 4) — the Newest-first invariant
// (CONTEXT.md: publishedAt descending, ties broken by slug ascending,
// sorted copy) plus formatDate's moved-verbatim behavior.
//
// Test families (one deliberate mutation per family demonstrated failing;
// transcripts in .sagan/ledger/T-005/qabuild/):
// 1. descending order            — mutation: flip the date comparison
// 2. slug tiebreak on equal dates — mutation: flip the tiebreak to desc
// 3. input non-mutation           — mutation: sort in place (drop the copy)
// 4. single-item and empty lists  — mutation: early-return the same reference
// 5. formatDate behavior          — mutation: month 'long' → 'short'
//    (T-008 collapsed formatDate to the absolute formatter — the
//    includeRelative pins were deleted with the branch; see below)
// 6. date agreement (T-006)       — mutation: comparator back to raw
//    new Date(publishedAt), i.e. UTC for date-only strings
//    (transcript in .sagan/ledger/T-006/qabuild/)
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { newestFirst, formatDate, asLocalInstant } from 'lib/dates'

/** Minimal Dated shape — mirrors {metadata: {publishedAt}, slug}. */
const entry = (slug: string, publishedAt: string) => ({
  slug,
  metadata: { publishedAt },
})

describe('newestFirst — descending order', () => {
  it('orders distinct publishedAt values newest first (the three real notes dates)', () => {
    // Mirrors today's app/notes/posts content: three notes, distinct dates.
    const input = [
      entry('building-conan', '2026-06-14'),
      entry('the-sagan-method', '2026-08-10'),
      entry('figma-to-paper', '2026-06-17'),
    ]
    assert.deepEqual(
      newestFirst(input).map((e) => e.slug),
      ['the-sagan-method', 'figma-to-paper', 'building-conan']
    )
  })

  it('orders full ISO datetime values within one day newest first', () => {
    const input = [
      entry('morning', '2026-08-10T09:00:00'),
      entry('evening', '2026-08-10T21:00:00'),
      entry('noon', '2026-08-10T12:00:00'),
    ]
    assert.deepEqual(
      newestFirst(input).map((e) => e.slug),
      ['evening', 'noon', 'morning']
    )
  })
})

describe('newestFirst — slug tiebreak on equal dates', () => {
  // Mirrors today's app/work/projects content exactly: three projects, one
  // shared publishedAt. The tiebreak (slug ascending) is what makes /work
  // render knav → perchhq → shift BY SPECIFICATION instead of by accident.
  it('breaks the three-way real-content tie by slug ascending regardless of input order', () => {
    const tied = [
      entry('shift', '2026-08-10'),
      entry('knav', '2026-08-10'),
      entry('perchhq', '2026-08-10'),
    ]
    assert.deepEqual(
      newestFirst(tied).map((e) => e.slug),
      ['knav', 'perchhq', 'shift']
    )
    // A second permutation must land identically — the order is a rule,
    // not an artifact of the input.
    const reversed = [...tied].reverse()
    assert.deepEqual(
      newestFirst(reversed).map((e) => e.slug),
      ['knav', 'perchhq', 'shift']
    )
  })

  it('applies the tiebreak only within a tie — a newer entry still leads older tied ones', () => {
    const input = [
      entry('b-old', '2026-06-01'),
      entry('a-old', '2026-06-01'),
      entry('z-new', '2026-08-01'),
    ]
    assert.deepEqual(
      newestFirst(input).map((e) => e.slug),
      ['z-new', 'a-old', 'b-old']
    )
  })
})

describe('newestFirst — input non-mutation (sorted copy)', () => {
  it('returns a new array and leaves the input order untouched', () => {
    const input = [
      entry('building-conan', '2026-06-14'),
      entry('the-sagan-method', '2026-08-10'),
      entry('figma-to-paper', '2026-06-17'),
    ]
    const snapshot = input.map((e) => e.slug)
    const result = newestFirst(input)
    assert.notEqual(result, input, 'must return a copy, not the input array')
    assert.deepEqual(
      input.map((e) => e.slug),
      snapshot,
      'input array order must be unchanged after the call'
    )
  })
})

describe('newestFirst — single-item and empty lists', () => {
  it('returns a one-item copy for a single-item list', () => {
    const input = [entry('only', '2026-08-10')]
    const result = newestFirst(input)
    assert.deepEqual(
      result.map((e) => e.slug),
      ['only']
    )
    assert.notEqual(result, input, 'single-item result must still be a copy')
  })

  it('returns an empty copy for an empty list', () => {
    const input: ReturnType<typeof entry>[] = []
    const result = newestFirst(input)
    assert.deepEqual(result, [])
    assert.notEqual(result, input, 'empty result must still be a copy')
  })
})

describe('date agreement — date-only publishedAt is LOCAL midnight everywhere (T-006)', () => {
  // The invariant: newestFirst and formatDate read a date-only string as the
  // SAME instant. Mechanism: both route through asLocalInstant, which keeps
  // formatDate's longtime T00:00:00 (local) injection — chosen over UTC
  // because formatDate renders via toLocaleString, so UTC would shift every
  // date-only entry to the previous day anywhere west of UTC. Local keeps
  // rendered date strings byte-identical (AC 3/AC 6).
  it('asLocalInstant reads a date-only string as local midnight', () => {
    assert.equal(
      asLocalInstant('2026-08-10').getTime(),
      new Date('2026-08-10T00:00:00').getTime()
    )
  })

  it('asLocalInstant passes a full ISO datetime through unchanged', () => {
    assert.equal(
      asLocalInstant('2026-08-10T15:30:00').getTime(),
      new Date('2026-08-10T15:30:00').getTime()
    )
  })

  it('newestFirst ties a date-only entry with its explicit local-midnight twin (slug tiebreak decides)', () => {
    // Under the pre-T-006 comparator (raw new Date → UTC for date-only),
    // these two are NOT the same instant on any non-UTC machine and the
    // tiebreak never fires — this pin fails. Under the agreement they tie,
    // so slug ascending decides.
    const input = [
      entry('b-midnight', '2026-08-10T00:00:00'),
      entry('a-dateonly', '2026-08-10'),
    ]
    assert.deepEqual(
      newestFirst(input).map((e) => e.slug),
      ['a-dateonly', 'b-midnight']
    )
  })

  it('a same-local-day afternoon datetime sorts newer than the date-only entry', () => {
    const input = [
      entry('dateonly', '2026-08-10'),
      entry('noon', '2026-08-10T12:00:00'),
    ]
    assert.deepEqual(
      newestFirst(input).map((e) => e.slug),
      ['noon', 'dateonly']
    )
  })

  it('formatDate renders a date-only string unchanged under the shared reader', () => {
    assert.equal(formatDate('2026-08-10'), 'August 10, 2026')
  })
})

// REPLACED (T-008, 2026-08-11): the two `includeRelative` pins died with the
// branch itself — zero callers ever passed true (grep-proven at T-006,
// re-proven at T-008), so formatDate collapsed to the absolute formatter.
// The surviving pins below are the function's whole remaining contract.
describe('formatDate — absolute "Month D, YYYY" formatter (relative branch deleted, T-008)', () => {
  it('formats a date-only string as "Month D, YYYY"', () => {
    assert.equal(formatDate('2026-08-10'), 'August 10, 2026')
  })

  it('accepts a full ISO datetime unchanged (no T00:00:00 injection)', () => {
    assert.equal(formatDate('2026-08-10T15:30:00'), 'August 10, 2026')
  })
})
