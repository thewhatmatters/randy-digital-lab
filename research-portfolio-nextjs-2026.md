# Building a Next.js Portfolio + Blog + Live Code Lab in 2026

**Type:** landscape / problem-solving · **Depth:** standard · **Date:** 2026-06-13
**Question:** Best way to build a personal portfolio site with Next.js (App Router) + Tailwind that combines a markdown/MDX portfolio, an MDX blog, and interactive "live code explorations" à la [lab01.dev](https://lab01.dev/) — covering content architecture, interactive-demo structure, motion, deployment, SEO/RSS, and whether to start from the Vercel portfolio-starter-kit.

---

## TL;DR / Recommendation

1. **Start from the Vercel `portfolio-starter-kit`.** It already ships exactly the boring-but-essential 80%: MDX/Markdown, SEO (sitemap, robots, JSON-LD), RSS, dynamic OG images, syntax highlighting, **Tailwind v4**, Geist font, and Speed Insights/Analytics ([Vercel template page](https://vercel.com/templates/next.js/portfolio-starter-kit)). Starting here saves days of plumbing.
2. **Keep content as local MDX files** rather than reaching for a CMS or Contentlayer. The starter's filesystem approach (`app/blog/posts/*.mdx` + a small `utils.ts`) is the lowest-maintenance path; Contentlayer development has stalled ([PkgPulse 2026](https://www.pkgpulse.com/guides/contentlayer-vs-velite-vs-next-mdx-remote-mdx-content-2026)). Add **Velite** only if/when you want type-safe frontmatter and validation.
3. **Treat "live explorations" as a first-class content type** — a `app/lab/[slug]` route where each experiment is an MDX page that can embed an interactive client component (Canvas/p5.js/react-three-fiber) and optionally a live code editor (**Sandpack**).
4. **Motion: layer it.** CSS transitions for hover/press, the **View Transitions API** for route/shared-element crossfades, and **Motion** (the independent successor to Framer Motion) for interruptible, gesture-driven microinteractions ([Motion Magazine](https://motion.dev/magazine/reacts-experimental-view-transition-api)).
5. **Deploy on Vercel**, lean on the App Router Metadata API for SEO, and keep heavy WebGL/canvas behind `dynamic(..., { ssr: false })` client boundaries.

---

## 1. The Vercel portfolio-starter-kit — what you actually get

The official template's verbatim feature list ([Vercel](https://vercel.com/templates/next.js/portfolio-starter-kit)):

> - MDX and Markdown support
> - Optimized for SEO (sitemap, robots, JSON-LD schema)
> - RSS Feed
> - Dynamic OG images
> - Syntax highlighting
> - Tailwind v4
> - Vercel Speed Insights / Web Analytics
> - Geist font

**Folder structure** (reconstructed from a [deep-dive walkthrough](https://www.renjith.com/blog/02-deeper-dive-vercel-portfolio-starter-kit) and the [overview](https://www.renjith.com/blog/01-vercel-portfolio-starter-kit)):

```
app/
  layout.tsx            # global styles, fonts, nav, footer
  global.css            # Tailwind v4 (@theme lives here in v4)
  page.tsx              # home
  components/
    mdx.tsx             # renders MDX + custom components + syntax highlighting
  blog/
    posts/              # *.mdx files — each becomes a route
    [slug]/page.tsx     # dynamic route per post
    utils.ts            # MDX processing, date formatting, post fetching
  og/                   # dynamic OG image route (/og?title=...)
  sitemap.ts / robots   # SEO
  rss                   # feed generation
```

**Verdict:** This is the right base. It is content-first, uses the modern App Router, and ships Tailwind v4 — so you inherit the current styling model with no migration. Drop a `lab/` section alongside `blog/` and you have all three pillars. A more design-heavy alternative is [Magic Portfolio](https://vercel.com/templates/next.js/magic-portfolio-for-next-js) (projects + blog + gallery, MDX-based), but it's more opinionated and heavier to restyle.

---

## 2. Content architecture: MDX files vs. Contentlayer vs. Velite vs. CMS

The field in 2026 ([PkgPulse comparison](https://www.pkgpulse.com/guides/contentlayer-vs-velite-vs-next-mdx-remote-mdx-content-2026), [Josh Comeau](https://www.joshwcomeau.com/blog/how-i-built-my-blog), [TheFrontKit 2026](https://thefrontkit.com/blogs/best-nextjs-blog-templates-2026)):

| Option | What it is | When to pick it |
|--------|-----------|-----------------|
| **`@next/mdx`** (official) | Author MDX pages directly in `app/` | Pages that are mostly bespoke layouts |
| **Filesystem + small util** (starter's approach) | Read `posts/*.mdx`, parse frontmatter, render with `next-mdx-remote`-style compile | **Default. Lowest maintenance, zero extra build deps** |
| **`next-mdx-remote`** | Compile MDX from anywhere (FS, DB, CMS) at request/build | When content may move off-disk later |
| **Velite** | Type-safe content collections, build-time validation, Zod schemas | When you want typed frontmatter + validation and Contentlayer-like DX that is *actively maintained* |
| **Contentlayer** | Type-safe content database | **Avoid for new projects — development has stalled** ([PkgPulse](https://www.pkgpulse.com/guides/contentlayer-vs-velite-vs-next-mdx-remote-mdx-content-2026)) |
| **Headless CMS** (Sanity/Payload/Contentful) | Editor UI, hosted content | Overkill for a solo portfolio; only if non-devs will edit |

**Recommendation:** Ship on the starter's filesystem approach. If you outgrow untyped frontmatter (likely once `lab/` entries carry structured metadata — tags, tools, hero image, "live" flag), migrate the data layer to **Velite** without changing where files live. It's the actively-maintained, type-safe successor to Contentlayer.

---

## 3. The "live explorations" lab — how to structure interactive demos

lab01.dev itself is Sebastiano Guerriero's portfolio of **12 numbered UI experiments** (01–12), each showing the design assets, typefaces, and interactive color swatches with copy-to-clipboard — i.e. polished UI craft pieces rather than WebGL toys ([fetched lab01.dev](https://lab01.dev/)). The "explorations" pattern is: **a numbered index → individual experiment pages, each a self-contained interactive component.** Model your `lab/` the same way.

**Three tiers of "live", by interactivity:**

1. **Generative / canvas art — p5.js.** Friendly, art-focused JS library; `noLoop()` for static one-shot pieces, `draw()` for animated ones ([p5.js](https://p5js.org), [Amplify DAI guide](https://amplifydai.com/en/resources/generative-art-p5js-guide-en)). Wrap the sketch in a client component and mount onto a ref'd `<canvas>`.
2. **3D / WebGL — react-three-fiber + drei.** R3F is a *renderer*, not a wrapper — it instructs React about meshes/materials the way react-dom instructs it about divs ([r/threejs](https://www.reddit.com/r/threejs/comments/1c5gw0l/react_three_fiber)). In the App Router: **mark the `<Canvas>` component `'use client'` and import it dynamically with `ssr: false` from a Server Component** ([Three.js Resources 2026](https://threejsresources.com/frameworks/three-js-nextjs), [Ryosuke starter](https://whoisryosuke.com/blog/2022/react-three-fiber-and-nextjs-starter-template)). Load GLTF models from `/public` (or a CDN) via `useGLTF` from drei.
3. **Editable live code — Sandpack.** CodeSandbox's component toolkit renders a real editor + live preview, and integrates cleanly into MDX. Josh Comeau documents a world-class playground built from `SandpackProvider` / `SandpackCodeEditor` / `SandpackPreview`, embedded in MDX ([Sandpack](https://sandpack.codesandbox.io), [Comeau playground](https://www.joshwcomeau.com/react/next-level-playground)). Use this when you want visitors to *tweak* the code, not just watch it run.

**Structural pattern:**

```
app/lab/
  page.tsx              # numbered index of experiments (01..N)
  [slug]/page.tsx       # renders experiment MDX
  experiments/
    01-flow-field.mdx   # prose + <FlowField/> client component embed
components/lab/
  Canvas.tsx            # 'use client' R3F canvas, imported via dynamic(ssr:false)
  Sketch.tsx            # 'use client' p5.js wrapper
  Playground.tsx        # 'use client' Sandpack wrapper
```

Each experiment page stays a Server Component (good for SEO/metadata); only the interactive island is client-side and lazily hydrated. This keeps the lab fast while letting individual pieces be as heavy as they need.

---

## 4. Motion & animation — layer three tools, don't pick one

Framer Motion is now independent and rebranded **Motion** ([Motion Magazine](https://motion.dev/magazine/reacts-experimental-view-transition-api)). The 2026 consensus is **complementary**, not either/or:

| Use case | Reach for | Why |
|----------|-----------|-----|
| Hover / press / simple state | **CSS transitions** | Zero JS, cheapest. Can't do layout shifts or non-animatable props |
| Route changes & shared-element crossfades | **View Transitions API** | Native, near-zero bundle; animates "the impossible" (e.g. crossfade between separate elements). But **uninterruptible** + awkward pseudo-element CSS, and can thrash paint on big pages — scope `view-transition-name` to few elements ([technspire](https://technspire.com/sv/blog/nextjs-15-view-transitions-retire-framer-motion), [Motion Magazine](https://motion.dev/magazine/reacts-experimental-view-transition-api)) |
| Interruptible microinteractions, gestures, scroll-linked, staggers, layout animations | **Motion** (~33kb) | Layout animations animate the impossible *with transforms* and are **interruptible** before/during play — superior for responsive feel ([Motion Magazine](https://motion.dev/magazine/reacts-experimental-view-transition-api)) |

**App Router caveats:** any component using Motion must be `'use client'`; `AnimatePresence` exit animations are historically fiddly in the App Router, and shared-layout animations have known issues — many people now prefer View Transitions for page-level moves ([LogRocket](https://blog.logrocket.com/advanced-page-transitions-next-js-framer-motion), [r/nextjs](https://www.reddit.com/r/nextjs/comments/1jp74fz/been_going_crazy_for_the_last_few_hours_is_it), [next.js#49279](https://github.com/vercel/next.js/issues/49279)). **Recommendation:** View Transitions for navigation, Motion for in-component life, CSS for the cheap stuff. Always honor `prefers-reduced-motion`.

---

## 5. Tailwind v4 — what changes

The starter ships **Tailwind v4**, which you'll inherit:

- **CSS-first config.** `tailwind.config.js` is replaced by a `@theme { ... }` block in your CSS; design tokens (colors, spacing, type, radius, shadows) live there ([Tailwind v4 blog](https://tailwindcss.com/blog/tailwindcss-v4), [digitalapplied migration](https://www.digitalapplied.com/blog/tailwind-css-v4-2026-migration-best-practices)).
- **Tokens become runtime CSS variables** automatically — referenceable in plain CSS, great for theming (dark/light) and for passing values into canvas/WebGL sketches ([Mavik Labs](https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026), [Tailwind blog](https://tailwindcss.com/blog/tailwindcss-v4)).
- **Next.js setup:** install `tailwindcss` + `@tailwindcss/postcss` (the PostCSS plugin, *not* the Vite plugin) — Next 15.1+ has built-in support ([tech-insider](https://tech-insider.org/tailwind-css-tutorial-dashboard-v4-2026), [designrevision](https://designrevision.com/blog/tailwind-nextjs-setup)).

This makes `global.css` the **single source of truth for design tokens** — which is exactly where your `DESIGN.md` spec should map to.

---

## 6. Project structure & SEO/RSS best practices

**Structure:** Don't dump everything in `app/`. Keep route files in `app/`, push reusable components/hooks/lib to a feature-oriented or top-level `components/`, `lib/`, `hooks/` (a common scalability mistake is co-locating all logic in `app/`) ([GitHub community discussion](https://github.com/orgs/community/discussions/190342), [r/nextjs folder structure](https://www.reddit.com/r/nextjs/comments/1dc17tv/best_practice_for_folder_structure_in_nextjs_app)). Route-specific components can live in a local `components/` folder beside the route.

**SEO** in the App Router is strongest when server-rendered content + the **Metadata API** + file-based conventions (`sitemap.ts`, `robots`, `opengraph-image`) + Core Web Vitals all work together ([digitalapplied SEO guide](https://www.digitalapplied.com/blog/nextjs-seo-guide), [FocusReactive](https://focusreactive.com/next-js-app-router-seo-overview)). The starter already wires sitemap, robots, JSON-LD, and dynamic OG images.

**RSS:** generate from the same MDX frontmatter the blog index uses — either the starter's built-in feed route or a `sitemap.js`/feed-generation script as Comeau and others do ([maxleiter](https://maxleiter.com/blog/build-a-blog-with-nextjs-13), [Comeau](https://www.joshwcomeau.com/blog/how-i-built-my-blog)).

**Caveat — RSC vs. animation:** adding `"use client"` turns a route from RSC into SSR/SSG; over-clientizing hurts crawlability and bundle size ([r/nextjs](https://www.reddit.com/r/nextjs/comments/1d48ok7/framer_motion_and_ssr)). Keep pages as Server Components and isolate interactivity into small client islands (the lab pattern in §3).

---

## 7. Recommended build path

1. `npx create-next-app` with the **portfolio-starter-kit** template (or clone it). Confirm Tailwind v4 + Geist + App Router.
2. Move design tokens into `@theme` in `global.css`, mapped from `DESIGN.md`.
3. Keep `app/blog/` as-is. Add `app/lab/` mirroring it (index + `[slug]` + `experiments/*.mdx`).
4. Build three client-island wrappers: `Sketch.tsx` (p5.js), `Canvas.tsx` (R3F, `dynamic` + `ssr:false`), `Playground.tsx` (Sandpack). Register them as MDX components so any experiment can embed them.
5. Add motion: View Transitions for nav, Motion for in-component microinteractions, CSS for hover/press; gate on `prefers-reduced-motion`.
6. (Optional) Adopt **Velite** when frontmatter typing/validation becomes worth it.
7. Deploy to Vercel; keep Speed Insights/Analytics on; verify Core Web Vitals.

---

## Open questions

1. **Shared 3D canvas across routes?** If you want one persistent WebGL scene spanning multiple lab routes (the harder "tunnel/view" pattern), that needs the R3F view-sharing setup ([Ryosuke starter / r/threejs](https://www.reddit.com/r/threejs/comments/1jhh42d/how_to_integrate_r3f_into_react_nextjs_15_react_19)) — not surfaced in detail here.
2. **Exact starter Next.js version** is not stated on the template page ([Vercel](https://vercel.com/templates/next.js/portfolio-starter-kit)); confirm at clone time.
3. **Sandpack bundle cost** on a content site (it's a heavy dependency) vs. read-only embedded sketches — measure before shipping it site-wide.
4. **Velite vs. staying untyped** — depends on how structured your lab metadata becomes; defer until there's real schema pain.

---

### Sources
Vercel template page · renjith.com (overview + deep dive) · PkgPulse MDX comparison 2026 · Josh W. Comeau (blog build + Sandpack playground) · TheFrontKit 2026 templates · Motion Magazine · technspire View Transitions · LogRocket page transitions · Three.js Resources 2026 · Ryosuke R3F starter · r/threejs + r/nextjs threads · p5.js + Amplify DAI · Sandpack docs · Tailwind v4 blog + digitalapplied + Mavik Labs + tech-insider · digitalapplied/FocusReactive SEO · maxleiter blog · GitHub Next.js structure discussion · lab01.dev (fetched)
