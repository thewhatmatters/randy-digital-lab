// Feed hygiene pins for lib/rss.ts (T-008 AC 4). The feed is a pure function
// (renderFeed) so these run without a server, against hostile fixtures the
// real content will hopefully never contain.
//
// Test families (one deliberate mutation demonstrated per family,
// transcripts in .sagan/ledger/T-008/qabuild/):
// 1. escapeXml unit contract   — all five XML entities, worst first
//                                (mutation: drop the `&` replacement)
// 2. hostile-title feed        — a title/summary full of markup renders as
//                                data, never as elements; the document stays
//                                well-formed (same mutation family)
// 3. feed anatomy              — <guid> per item (the permalink),
//                                <lastBuildDate> in the channel, notes-only
//                                item set ordered newest first
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { escapeXml, renderFeed } from 'lib/rss'

/** A raw ampersand or angle bracket that is NOT part of an entity we emit —
 *  its presence in an escaped region means the escaping regressed. */
const RAW_AMP = /&(?!(?:amp|lt|gt|quot|apos);)/

/** All text contents of `<tag>…</tag>` occurrences, in document order. */
function extractAll(feed: string, tag: string): string[] {
  return (feed.match(new RegExp(`<${tag}>.*?</${tag}>`, 'g')) ?? []).map(
    (hit) => hit.slice(tag.length + 2, -(tag.length + 3))
  )
}

const hostilePost = {
  slug: 'hostile',
  metadata: {
    title: `Fish & Chips <b>"bold"</b> & <i>it's</i> nested & raw`,
    publishedAt: '2026-08-10',
    summary: `Summary with </description> & a fake close tag`,
  },
}

const plainPost = {
  slug: 'plain',
  metadata: {
    title: 'A plain title',
    publishedAt: '2026-06-14',
    summary: 'A plain summary.',
  },
}

describe('escapeXml — every XML-significant character becomes an entity', () => {
  it('escapes & first (never double-escapes the entities it just made)', () => {
    assert.equal(escapeXml('a & b &amp; c'), 'a &amp; b &amp;amp; c')
  })

  it('escapes < > " \' to their entities', () => {
    assert.equal(
      escapeXml(`<tag attr="x" other='y'>`),
      '&lt;tag attr=&quot;x&quot; other=&apos;y&apos;&gt;'
    )
  })

  it('passes ordinary prose through unchanged (unicode, dashes, colons)', () => {
    const prose = 'Dashboard Confessional: I built one — with “smart quotes”'
    assert.equal(escapeXml(prose), prose)
  })
})

describe('renderFeed — hostile title stays data, document stays well-formed', () => {
  it('emits no raw & or < from interpolated fields anywhere in the document', () => {
    const feed = renderFeed([hostilePost])
    // Strip the markup we emitted ourselves; what remains between tags is
    // interpolated text content, which must be entity-clean.
    const textContent = feed
      .split(/<[^>]*>/)
      .join('\n')
      .trim()
    assert.doesNotMatch(textContent, RAW_AMP, 'raw & leaked into text content')
    assert.doesNotMatch(textContent, /</, 'raw < leaked into text content')
  })

  it('renders the hostile title escaped, byte for byte', () => {
    const feed = renderFeed([hostilePost])
    assert.ok(
      feed.includes(
        'Fish &amp; Chips &lt;b&gt;&quot;bold&quot;&lt;/b&gt; &amp; ' +
          '&lt;i&gt;it&apos;s&lt;/i&gt; nested &amp; raw'
      ),
      'escaped hostile title not found in the feed'
    )
  })

  it('a summary containing </description> cannot close the real element early', () => {
    const feed = renderFeed([hostilePost])
    // Exactly two REAL closing tags — the channel's and the one item's; the
    // injected one survives only as entities.
    assert.equal(feed.split('</description>').length - 1, 2)
    assert.ok(feed.includes('&lt;/description&gt;'))
  })

  it('every opened element closes: the tag multiset is balanced', () => {
    const feed = renderFeed([hostilePost, plainPost])
    const stripName = (tag: string) => tag.replace(/[<>/]|\s.*$/g, '')
    const opens = (feed.match(/<[a-zA-Z][\w]*(?:\s[^>]*)?>/g) ?? []).map(
      stripName
    )
    const closes = (feed.match(/<\/[a-zA-Z][\w]*>/g) ?? []).map(stripName)
    const count = (names: string[]) =>
      names.reduce<Record<string, number>>((acc, name) => {
        acc[name] = (acc[name] ?? 0) + 1
        return acc
      }, {})
    assert.deepEqual(count(opens), count(closes))
  })
})

describe('renderFeed — anatomy: guid, lastBuildDate, notes-only, newest first', () => {
  it('carries a permalink <guid> per item, equal to its <link>', () => {
    const feed = renderFeed([hostilePost, plainPost])
    const links = extractAll(feed, 'link')
    const guids = extractAll(feed, 'guid')
    // links[0] is the channel link; the rest pair 1:1 with guids.
    assert.deepEqual(guids, links.slice(1))
    assert.deepEqual(guids, [
      'https://randy.digital/notes/hostile',
      'https://randy.digital/notes/plain',
    ])
  })

  it('carries exactly one channel <lastBuildDate> in UTC string form', () => {
    const feed = renderFeed([plainPost])
    const stamps = extractAll(feed, 'lastBuildDate')
    assert.equal(stamps.length, 1)
    assert.ok(
      !Number.isNaN(new Date(stamps[0]).getTime()),
      'lastBuildDate must parse as a date'
    )
    assert.match(stamps[0], /GMT$/)
  })

  it('orders items newest first (the shared newestFirst rule)', () => {
    const feed = renderFeed([plainPost, hostilePost]) // oldest first on input
    const guids = extractAll(feed, 'guid')
    assert.deepEqual(guids, [
      'https://randy.digital/notes/hostile', // 2026-08-10
      'https://randy.digital/notes/plain', // 2026-06-14
    ])
  })

  it('renders one <item> per post — the item set is exactly what the route passes (notes only)', () => {
    const feed = renderFeed([hostilePost, plainPost])
    assert.equal(feed.split('<item>').length - 1, 2)
    assert.equal(feed.split('</item>').length - 1, 2)
  })
})
