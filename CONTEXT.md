# randy-digital

Personal portfolio site: notes (essays), work (project case studies with
a morph-modal viewer), and a coming lab of interactive experiments — all
filesystem MDX behind shared pipeline modules in `lib/`.

## Language

**Note**:
A single-author essay under `app/notes/posts/`, rendered with the
editorial margin (Margin/PullQuote/Figure).
_Avoid_: post, blog entry, article

**Work project**:
A portfolio case study under `app/work/projects/` — carousel imagery,
writeup, meta rows — shown as a tile that morphs into a modal.
_Avoid_: case study (as a code term), portfolio item

**Stand-in**:
A work project whose body and `Status: Placeholder` meta declare it is
not real shipped work; proves layout before real content lands.
_Avoid_: placeholder (ambiguous with UI placeholders), dummy

**Newest-first**:
The one ordering rule for content listings and feeds: `publishedAt`
descending, tied entries broken by slug ascending; a date-only
`publishedAt` means LOCAL midnight everywhere (`asLocalInstant`, shared
by ordering and rendering). Owned by `newestFirst()` in `lib/dates.ts`;
no caller re-implements it.
_Avoid_: sort by date, chronological (backwards)

**Validation floor**:
The per-pipeline required-field list (notes: title/publishedAt/summary;
work: + thumbnail/images≥1) enforced by the shared content reader; a
breach is a `ContentFileError` naming the file and problem, failing the
build loudly.
_Avoid_: schema check (too generic), frontmatter linting

**Morph**:
The shared-element transition where a work tile's current slide grows
into the modal (and reverses on close), measured live from the DOM.
_Avoid_: zoom, expand animation
