---
source: "https://vercel.com/templates/next.js/portfolio-starter-kit"
type: webpage
title: "Next.js Portfolio Starter Kit (Vercel template)"
ingested: 2026-06-13
tier: web fetch (requests)
---

## What it is

The **Next.js Portfolio Starter Kit** — Vercel's official template for a portfolio site that ships with a blog. Content-first, App Router, Tailwind v4. Live demo: https://portfolio-blog-starter.vercel.app (§ Demo).

## Included features (verbatim from § "Portfolio Blog Starter")

- MDX and Markdown support
- Optimized for SEO (sitemap, robots, JSON-LD schema)
- RSS Feed
- Dynamic OG images
- Syntax highlighting
- Tailwind v4
- Vercel Speed Insights / Web Analytics
- Geist font

## How to use (§ "How to Use")

Two methods:

1. **One-Click Deploy** via Vercel.
2. **Clone & deploy** — bootstrap with create-next-app (uses pnpm in the docs):
   ```
   pnpm create next-app --example https://github.com/vercel/examples/tree/main/solutions/blog blog
   pnpm dev
   ```

- **Source repo:** `vercel/examples` → path `solutions/blog`.
- **Stack:** Next.js + Tailwind. **Use cases:** Portfolio, Blog.

## Folder structure (from community deep-dive, not the template page itself)

- `app/layout.tsx` — global styles, fonts, nav, footer
- `app/global.css` — Tailwind v4 (`@theme` design tokens live here)
- `app/components/mdx.tsx` — renders MDX + custom components + syntax highlighting
- `app/blog/posts/*.mdx` — each file becomes a post route
- `app/blog/[slug]/page.tsx` — dynamic per-post route
- `app/blog/utils.ts` — MDX processing, date formatting, post fetching
- Dynamic OG images served via `/og?title=...`; sitemap/robots/RSS generated at build

## Why it matters for this project

This is the chosen base for randy-digital. It already provides the "boring 80%" (MDX, SEO, RSS, OG, Tailwind v4, Geist, analytics). The plan is to clone it, then add a parallel `app/lab/` section for interactive code explorations and layer in motion. Note: the template page does **not** state the exact Next.js version — confirm at clone time.
