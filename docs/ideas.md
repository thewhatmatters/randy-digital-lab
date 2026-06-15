# Product ideas / backlog

Captured so ideas survive between sessions. Each entry: the idea, why it's
interesting, how it'd likely work, and the honest considerations. Promote to
`HANDOFF.md` next-steps when one becomes real work.

**Status (2026-06-13):** #1 (voice notes) and #2 (copy-prompt) are **decided —
build, both free**. #3's paywall model is **shelved**; monetization is an open
brainstorm (see the Monetization angles section). #4 (Virtual Randy) is
captured with its objections so it isn't re-litigated.

_Started 2026-06-13._

---

## 1. Voice version of each note  ✅ DECIDED — build, free

**Idea:** an audio version of each note, playable inline.

**Why:** on-brand (notes are short-form → short clips, cheap), accessibility
win, and a distinctive touch. Matches the first-person, understated voice.

**How it'd likely work:** a `voice:` / `audio:` frontmatter field on the post
MDX pointing at an audio file; a small mono player island on the post page.
Fits the existing MDX pipeline with no new architecture.

**Considerations / open fork:**
- **Randy's real voice vs. synthetic TTS.** Real voice = genuine
  differentiator, but a recurring production commitment. TTS
  (ElevenLabs / OpenAI) = near-free + instant, but less personal.
- Low technical risk either way.

---

## 2. Lab "copy prompt" for agents  ✅ DECIDED — build, free

**Idea:** each lab experiment ships a prompt/spec an agent can consume to
replicate the experiment ("copy prompt" button, or a machine-readable route).

**Why:** strongest + most on-brand idea — a technical portfolio legible to
agents. Rides a real trend (docs sites shipping "copy page as markdown for the
LLM" buttons; `llms.txt`). Compounds audience + credibility on its own.

**How it'd likely work:** a tested prompt per experiment — frontmatter
`prompt:` or a sibling `experiment.prompt.md`; a "copy prompt" button; optional
`/lab/[slug]/prompt` route returning the raw spec. Fits the planned MDX +
client-island Lab structure; no new infra.

**Considerations:**
- Build **free**, and keep it free — it stands on its own as audience +
  credibility, and it's the agent-legibility foundation everything else leans on.
- Worth instrumenting interest anyway (copy counts) to inform monetization.

---

## 3. Paid experiment-unlock  ⛔ SHELVED (paywall model)

Original idea: gate the full prompt + scaffold behind a paywall and sell the
unlock. **Decision: not pursuing the paywall.** Copy-prompt ships free (#2).
Reasons it was shelved: thin moat where the output is already visible on the
page (you'd be selling a *shortcut*, not secret knowledge); it changes the
app's shape (auth + payments + entitlements = portfolio → app); and micro-payment
friction. Monetization is being rethought — see the section below.

---

## 4. "Virtual Randy" / agent-legible portfolio

**Grand vision (Randy):** the whole portfolio *is* an agent. Notes encode his
approaches, lab experiments encode his UI eye — and *hiring him unlocks "Virtual
Me,"* an agent grounded in all of it.

**Devil's-advocate objections (recorded so we don't re-litigate):**
1. **Undercut paradox (the big one).** The portfolio exists to get *real Randy*
   hired. A convincing Virtual Randy argues the opposite — "don't hire him, rent
   the agent." The better it works, the more it commoditizes him.
2. **Artifacts ≠ judgment.** RAG over notes + few-shot on components can *quote*
   approaches and *pastiche* UI, but can't *exercise taste* on a new ambiguous
   brief — which is the 90% that makes him hireable and isn't in the corpus.
3. **Data too thin to be "him"** — output skews generic base-model + a thin
   veneer, and can *misrepresent* him (hallucinated opinions, mediocre UI in his
   name) — a liability on the asset meant to impress.
4. **No eval, adversarial users.** Hiring managers will poke it to break it; no
   ground truth for "what would Randy say," so it can't be QA'd.
5. **Two goals pull apart.** "Get hired" vs "ship an AI product" optimize for
   different things; "hiring unlocks it" is chicken-and-egg (they decide before
   they'd ever unlock).

**Reshaped / feasible version (the keeper):** not *cloning* Randy — a portfolio
that **proves he can build tasteful agent experiences, using his own work as the
demo content.** Concretely: a **scoped assistant** answering "how does Randy
approach X?" grounded *only* in the notes, **with citations**, that says "not in
my notes" off-corpus (no hallucinated Randy); framed explicitly as a *capability
demo* ("I build agent UX — here's one over my own work"), not "me in a box."
Fuses with #2 → through-line "my portfolio is itself an agentic product," a
*stronger* hire signal for AI / design-engineering roles, without the undercut
paradox (it sells his ability to build the thing, not a replacement for him).

**Status:** grand version parked; reshaped version is a candidate once #1/#2
land and there's a notes corpus to ground it. Buildable with RAG over the MDX.

---

## 5. "Dev overlay" as a lab experiment (+ house UI motif)

**Idea:** recreate the Next.js / Turbopack **build-error overlay** as a reusable
UI element — the floating rounded card on a soft gradient backdrop, the tabbed
paginator (‹ 1/1 ›), the mono `Build Error` pill, the status pill (dot +
version + `stale` / `Turbopack`), the copy/docs icon buttons, and the
syntax-highlighted code frame with line numbers, the `>` error-line pointer,
the `^^^^` caret underline, a file-path header, and the import trace. Surfaced
by accident during the `/blog → /notes` rename (a stale-Turbopack flash); the
form is genuinely nice.

**Why:** lands squarely in the **technical-mono** half of the design system and
is instantly legible to the developer audience a design-engineer portfolio is
for. Self-contained around a single characterful UI element — exactly the Lab
brief. Could double as a house motif (a knowing 404 / error page, or a framing
device for content).

**How it'd likely work:** a presentational `<DevOverlay>` component as its own
numbered Lab experiment. Mostly static + a little state: a working paginator to
cycle N mock "errors", a real copy button, a reduced-motion-friendly entrance.
Syntax highlighting via the existing **`sugar-high`** dep (already used for MDX
code) — no new infra; fits the planned MDX + client-island Lab pattern. Pairs
with #2 (copy-prompt) — the card already carries the copy affordance.

**Considerations:**
- Keep it clearly **intentional**, not mistakable for a real crash — let the
  content signal play (friendly/poetic "errors", or frame *real* content as an
  "error"). Also avoid colliding visually with Next's actual dev overlay while
  developing.
- The interesting version **does something** with the form (subverts it), not a
  static screenshot clone.
- Strong candidate to be the **inaugural experiment** that also stands up the
  Lab pattern (HANDOFF step 5) — low risk, high charm.

---

## Monetization angles (open brainstorm — Randy + Claude)

The paywall (#3) is shelved. Better fits for a designer/design-engineer whose
*primary* goal is getting hired — these mostly *amplify* the hire signal instead
of commoditizing him. Randy is adding his own; here are mine:

- **Hire / retainer as the headline CTA.** The agent-legible portfolio's real
  monetization is high-value employment or a consulting retainer. Keep "work
  with me" the loudest call — it's the opposite of the undercut paradox (sells
  *access to real Randy*).
- **Reach as top-of-funnel.** Free copy-prompts carry quiet attribution
  ("from a Randy lab experiment"). Free distribution → his name lands in other
  people's agent contexts → inbound for hiring/consulting. Monetize the *reach*
  later, not the artifact.
- **Productized templates / starter kits.** Sell the *polished, documented*
  scaffolds behind select experiments as one-time digital goods (Gumroad /
  Polar / LemonSqueezy). Distinct from the shelved "unlock" — these are
  supported boilerplates with a known market, low ongoing maintenance.
- **Sponsored experiments.** A company pays Randy to build a *public* lab
  experiment exploring a UI problem in their product — content marketing for
  them, a portfolio piece + fee for him.
- **Notes → paid depth.** If the notes find an audience, a paid deep-dive
  series / workshop / talk is a natural funnel extension (the free notes are the
  top of it).
- **Sponsorship / tip jar** (GitHub Sponsors) on the free tooling — open-core
  framing: free builds reputation, sponsors fund upkeep.

_(Add more here as either of us thinks of them.)_
