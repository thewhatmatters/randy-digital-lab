// Dates, given a home (T-005). Two things live here and nowhere else:
//
// 1. newestFirst — the site's ONE ordering rule for content listings and
//    feeds ("Newest-first" in CONTEXT.md): publishedAt descending, tied
//    entries broken by slug ascending. No caller re-implements it; the
//    comparator stays internal so the rule can't be partially borrowed.
// 2. formatDate — the shared date formatter (moved verbatim from
//    app/notes/utils.ts, where it lived while work imported it across
//    the notes boundary).

type Dated = {
  metadata: { publishedAt: string }
  slug: string
}

/**
 * The ONE interpretation of a `publishedAt` string (T-006 date agreement):
 * a date-only value means LOCAL midnight — the same `T00:00:00` injection
 * formatDate has always applied, now shared with newestFirst's comparator
 * (which used to hand date-only strings to `new Date()` raw, i.e. UTC —
 * the two readers disagreed by the machine's UTC offset). Local, not UTC,
 * is deliberate: formatDate renders through toLocaleString, so a UTC
 * interpretation would shift every date-only entry to the previous day
 * anywhere west of UTC. Local keeps rendered date strings byte-identical.
 */
export function asLocalInstant(date: string): Date {
  return new Date(date.includes('T') ? date : `${date}T00:00:00`)
}

// Internal on purpose (not exported): callers get the sorted copy, never
// the raw comparator — the tiebreak is part of the rule, not an option.
function byNewestFirst(a: Dated, b: Dated): number {
  const delta =
    asLocalInstant(b.metadata.publishedAt).getTime() -
    asLocalInstant(a.metadata.publishedAt).getTime()
  if (delta !== 0) return delta
  // Equal publishedAt → slug ascending, so listings with shared dates
  // (today: all three work projects) have a specified, stable order.
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0
}

/**
 * Newest-first: returns a sorted COPY (input never mutated) — publishedAt
 * descending, ties broken by slug ascending.
 */
export function newestFirst<T extends Dated>(items: T[]): T[] {
  return [...items].sort(byNewestFirst)
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  let targetDate = asLocalInstant(date)

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
