# Industrial Signal Theater Design

**Date:** 2026-03-13

**Context**

This project is not a public-facing AI daily newspaper. It is a personally used, GitHub-hosted AI aggregation surface that should feel premium, distinctive, and fast to scan. The homepage should combine brand-stage impact with an efficient information cockpit.

**Product Positioning**

- A private AI intelligence surface for daily scanning.
- Optimized for "open, scan fast, sweep categories, leave".
- Publicly hosted, but not designed around mass-market onboarding, SEO funnels, or editorial storytelling.

**Design Direction**

- Primary direction: hybrid layout.
- Visual mood: industrial intelligence surface.
- Interaction model: static-first with light client-side enhancements.
- Glow intensity: closer to OpenClaw homepage, but constrained to hero atmosphere and key signals instead of every surface.

## Goals

- Make the homepage feel more premium and memorable.
- Improve scan speed for top stories and category review.
- Preserve strong atmosphere without compromising readability.
- Keep the site compatible with static hosting on GitHub Pages.

## Non-Goals

- Building a full archive product in this phase.
- Adding heavy client-side app behavior.
- Introducing search, auth, personalization, or backend services.
- Turning the page into a conventional media/news site.

## Core Experience

When opened, the page should feel like a high-end AI command stage. The first screen establishes mood and immediately answers:

- What date is this feed for?
- How much material landed today?
- What is the top signal?
- Which categories are active?

After the first screen, the page should transition into a structured cockpit that supports quick category sweeps and selective click-through.

## Visual System

### Tone

- Deep layered coal, graphite, and blue-gray foundation.
- Strong atmospheric glow inspired by OpenClaw.
- Hard-edged card geometry and system labeling.
- Industrial overlays: grids, registration lines, noise, scan textures, indices.

### Color Roles

- Warm energy accent: amber/orange for primary signals, key metrics, and action emphasis.
- Cool structural accent: electric blue for borders, dividers, and supporting controls.
- Optional alert accent: restrained red for unusually hot or cautionary items.
- Text should stay stable and mostly non-gradient in content zones.

### Typography

- Display face for hero and section titles: condensed, assertive, industrial.
- Readable sans for body copy and summaries.
- Monospace for timestamps, counters, and state labels.

### Materiality

- Hero uses the highest glow, haze, and depth.
- Main cards feel like machined panels, not glass or liquid metal.
- Accent lighting appears on edges, corners, and active states.
- Standard cards remain restrained to protect scan efficiency.

## Information Architecture

The homepage should be reorganized into five zones.

### 1. Global Rail

A lightweight sticky rail replaces the current implicit navigation. It should contain:

- Brand name
- Current date
- Update status
- Anchor links to `Top Signals`, `Categories`, and `Community`

This rail becomes more solid as the user scrolls.

### 2. Signal Deck

This replaces the current large hero-only stage. It should include:

- Strong page title
- One-line intelligence summary from available metadata
- Key metrics: item count, source count, community count
- A primary signal card for the top item

This is the main place to concentrate OpenClaw-level glow.

### 3. Top Signals

A ranked strip of the most important stories:

- One dominant card
- Several secondary cards
- Clear source, time, tags, and click affordance

The goal is fast prioritization, not browsing depth.

### 4. Category Sweep

This is the highest-utility section for the user's workflow.

- Default view should show all categories in a compact sweep.
- Light interaction allows filtering by category.
- Each category should show the count and the strongest few items.
- Cards should share a unified interaction model.

### 5. Community Pulse

Community content remains separate from source articles.

- Use a visually distinct strip or band.
- Treat discussions as social signals, not equivalent article cards.

### 6. Source Ledger

A low-noise bottom section can expose:

- Source distribution
- Coverage balance
- Optional editor note / generated note

This makes the page feel like an intelligence surface rather than a generic feed.

## Interaction Model

- Static HTML remains the baseline.
- Lightweight enhancements are acceptable for sticky rail behavior, anchor highlighting, and category filtering.
- Hover behavior should be subtle and fast.
- No interaction should be required to understand the page's main value.

## Motion

- Hero entrance may be theatrical.
- Content interactions must stay tight and efficient.
- Category switch motion should be short fade/translate transitions.
- Respect `prefers-reduced-motion`.

## Accessibility

- Add a real `main` landmark and skip link.
- Use meaningful alt text for content images when images communicate article context.
- Preserve visible focus states.
- Raise low-contrast tertiary text where necessary.
- Keep tab order aligned with visual order.

## Content Rules

- The page should no longer imply that all content is directly visible if only a subset is shown.
- Top-level metrics must match what is actually represented.
- Empty summaries need a compact fallback presentation.
- Missing images should degrade gracefully without looking broken.

## Implementation Notes

- Keep Astro static output.
- Prefer reusing the existing `ReportCard` as a base only if its interaction model can be normalized cleanly.
- If not, split it into purpose-specific components such as `SignalCard`, `SweepCard`, and `CommunitySignal`.
- Introduce page-level data shaping in `src/pages/index.astro` only where it simplifies rendering and avoids duplicated logic.

## Success Criteria

- The page feels distinct and premium on first view.
- The first screen immediately communicates daily value.
- Category sweep is noticeably faster to parse.
- Navigation and click behavior are consistent.
- The visual system feels closer to OpenClaw in energy, but more structured and utility-focused.
