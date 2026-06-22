# Strategy Sankey — fitting AI, Design & Development into a credible flow

_Deep research · type: landscape · depth: standard · 2026-06-22_

A node/flow model for the **Strategy** service tile: a Sankey that shows how
Randy's capabilities (**AI · Design · Development**) flow through **strategic
activities** into **outcomes** and ultimately **value** — structured so the
nodes read as intentional, grounded in established strategy/design frameworks
rather than arbitrary.

## Recommendation (TL;DR)

A **4-column convergent funnel** that mirrors the reference example's shape
(capabilities → activities → outcome → value), but populated from Randy's real
capabilities:

```
CAPABILITIES        STRATEGIC ACTIVITIES      OUTCOME            VALUE
(what I bring)      (what strategy directs)   (near-term)        (ultimate)

AI ............▶ Personalization & Intel ┐
                                          ├─▶ Product–Market Fit ─▶ Business
Design .......▶ Positioning & Strategy ──┤                          Value
                                          │
Development ..▶ Design Systems & Delivery┘
```

- **Column 1 — Capabilities (sources):** `AI`, `Design`, `Development`
- **Column 2 — Strategic activities:** `Personalization & Intelligence`,
  `Positioning & Product Strategy`, `Design Systems & Delivery`
- **Column 3 — Outcome:** `Product–Market Fit`
- **Column 4 — Value:** `Business Value` (a.k.a. brand & growth)

This is the same skeleton as the reference Sankey (3 capability sources → 3
activities → 1 satisfaction-style outcome → 1 quality/value node), so it will
feel familiar and "correct" to anyone who's seen a strategy flow, while the
labels are specific to Randy.

## Why this structure is defensible (framework grounding)

**Left column = capabilities.** Capability-mapping is the standard way to model
"what an organization can do" and trace those abilities to outcomes — capability
maps exist precisely to connect *what you're able to do* to *strategic results*
([Jibility](https://www.jibility.com/blog/what-is-a-capability-map),
[Umbrex](https://umbrex.com/resources/frameworks/strategy-frameworks/capability-map),
[Acorn](https://acorn.works/blog/capability-mapping)). Putting AI / Design /
Development as the source nodes is textbook capability-as-input.

**Middle column = value-creating activities.** Porter's Value Chain frames a
business as **primary activities that transform inputs into value/margin**
([Lucidity](https://getlucidity.com/strategy-resources/guide-to-porters-value-chain),
[Inchainge](https://inchainge.com/knowledge/value-chain)). The middle band is
the Sankey analog: the activities where capabilities are *combined* into
something worth more than its parts. Service-design blueprinting makes the same
move — mapping inputs through service activities to customer value
([Miro](https://miro.com/customer-journey-map/how-to-make-effective-service-blueprints),
[Smaply](https://www.smaply.com/blog/service-blueprints)).

**The three chosen activities** map cleanly to the three capabilities while
each still drawing from all three (which is what makes a Sankey interesting):
- `Personalization & Intelligence` — AI-led; the AI-in-product literature
  consistently lists personalization, customer service and data analysis as the
  outcomes AI capability produces
  ([SkalUP](https://www.skalup.com/how-ai-revolutionizes-product-personalization),
  [Bloomreach](https://www.bloomreach.com/en/blog/machine-learning-to-personalize-shopping-experience),
  [NICE](https://www.nice.com/info/mastering-ai-driven-personalization-top-strategies-for-modern-customer-experience-cx)).
  This is exactly the reference example's middle layer.
- `Positioning & Product Strategy` — Design/thinking-led; "what to build and
  why" is the core of product strategy, which connects vision → strategy → a
  North-Star outcome
  ([Glassbox](https://www.glassbox.com/blog/product-strategy-framework),
  [LaunchNotes](https://www.launchnotes.com/blog/the-ultimate-guide-to-the-north-star-product-framework)).
  It's also Randy's literal Strategy-tile copy ("positioning before pixels").
- `Design Systems & Delivery` — Design+Development-led; the build/iterate band
  (Double Diamond's *Develop → Deliver*,
  [UXPin](https://www.uxpin.com/studio/blog/double-diamond-design-process)).

**Right columns = outcomes, not outputs.** The "outcomes over outputs"
principle says strategy should terminate in a *change in the world*, not a
deliverable ([Dovetail](https://dovetail.com/product-development/outcome-vs-output-product-management),
[Atlassian](https://www.atlassian.com/software/jira/product-discovery/resources/handbook/outcomes)).
`Product–Market Fit` is the canonical near-term product outcome
([Appinio](https://www.appinio.com/en/blog/market-research/product-market-fit)),
and a single `Business Value` convergence node plays the role the reference's
`E-Service Quality` does — the thing everything ultimately serves.

## Concrete node list + link weights

Link width in a Sankey encodes magnitude, so weights are the "relative
emphasis" knob — they don't need to be precise, but they should be *legible*
([Domo](https://www.domo.com/learn/charts/sankey-diagrams),
[think.design](https://think.design/services/data-visualization-data-design/sankey-diagram)).
Recommended illustrative weights (each capability = 100, like the reference):

**Capabilities → Activities** (each source splits by affinity, but touches all
three middle nodes — the cross-links are what make it read as *synthesis*):

| from | → Personalization | → Positioning | → Design Systems |
|------|------:|------:|------:|
| AI (100) | 60 | 25 | 15 |
| Design (100) | 15 | 50 | 35 |
| Development (100) | 30 | 15 | 55 |
| **activity total** | **105** | **90** | **105** |

**Activities → Outcome** (narrows — strategy is *focus*; choosing what not to
pursue is the point, so not all flow converts. The reference narrows 300→120
here too):

| from | → Product–Market Fit |
|------|------:|
| Personalization & Intelligence (105) | 45 |
| Positioning & Product Strategy (90) | 50 |
| Design Systems & Delivery (105) | 35 |
| **PMF total** | **130** |

**Outcome → Value** (final distillation, mirroring the reference's 120→100):

| from | → Business Value |
|------|------:|
| Product–Market Fit (130) | 100 |

**Weight rationale.** (1) Equal sources (100/100/100) say "three equal core
capabilities." (2) The diagonal-dominant matrix (AI→Personalization 60,
Design→Positioning 50, Dev→Design Systems 55) gives each capability a clear
"home," while the off-diagonal cross-links (e.g. Dev→Personalization 30) signal
that real strategy blends them. (3) The two narrowing steps (300→130→100)
visually encode **prioritization** — the strategic act of distilling many
inputs into one focused outcome — which is the single most important idea the
Strategy tile is trying to convey.

## Notes for the build

- A real Sankey layout (d3-sankey) is overkill for a decorative tile; like the
  IDE/timeline visuals, **hand-author the geometry** (node rects + cubic-Bézier
  ribbons) so it stays a pure SVG Server Component, tokens-only. The accent
  (red) is the natural highlight for the converging `Business Value` ribbon —
  the one "signal" moment.
- Keep labels short on the tile (`AI`, `Design`, `Dev` · `Personalization`,
  `Positioning`, `Systems` · `Product–Market Fit` · `Value`) — the overflow/
  clip convention means not all of it needs to be legible at once.
- Dot-pattern canvas background (requested) reads as a design/whiteboarding
  surface — fits the "Strategy = thinking before pixels" framing.

## Open questions

1. **Four labels or three?** Dropping the final `Business Value` node (3-column
   AI/Design/Dev → activities → PMF) is simpler and may fit the narrow tile
   better. Worth trying both.
2. **Should `Motion` be a 4th source?** Randy's services are Design / Dev /
   Strategy / Motion. Motion could be a faint 4th input, but it muddies the
   clean 3→3→1→1 reference shape. Recommend leaving it out.
3. **Exact convergence styling** — whether all activities funnel into a single
   PMF node or PMF + a second outcome (e.g. `Brand`) — is an aesthetic call for
   the visual pass.

---
_Sources: 10 (Tavily search). Frameworks: capability mapping, Porter value
chain, product strategy / North Star, outcomes-over-outputs, Double Diamond,
service blueprint, AI-personalization, Sankey best practice._
