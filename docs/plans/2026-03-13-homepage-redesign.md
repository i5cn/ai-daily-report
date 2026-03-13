# Homepage Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Astro homepage into an industrial, high-glow personal AI aggregation surface with faster scan behavior and light client-side interaction.

**Architecture:** Keep Astro static rendering as the foundation and reshape the homepage with stronger page-level sections, normalized card patterns, and one lightweight client-side interaction layer for sticky rail and category filtering. Reuse existing data loading but refactor rendering into clearer section-specific components and more deliberate design tokens.

**Tech Stack:** Astro 5, static HTML/CSS, small inline client-side JavaScript, existing project data JSON, existing Node build tooling

---

### Task 1: Capture the current homepage structure and constraints

**Files:**
- Review: `src/pages/index.astro`
- Review: `src/components/ui/ReportCard.astro`
- Review: `src/layouts/BaseLayout.astro`
- Review: `src/styles/global.css`
- Review: `data/reports/latest.json`

**Step 1: Confirm current route and component footprint**

Run: `find src/pages -maxdepth 2 -type f | sort && rg -n "ReportCard|hero|community|archive" src`
Expected: only the homepage route and its current card/layout references are listed

**Step 2: Confirm current build output**

Run: `npm run build`
Expected: static build succeeds and produces only the current homepage route

**Step 3: Write down the exact issues to preserve during refactor**

Record:
- `/archive` currently has no route
- card click behavior is inconsistent
- hero and content sections use different visual grammars
- low-value metadata is missing from the page

**Step 4: Commit planning notes if needed**

```bash
git add docs/plans/2026-03-13-industrial-signal-theater-design.md docs/plans/2026-03-13-homepage-redesign.md
git commit -m "docs: add homepage redesign design and plan"
```

### Task 2: Establish the new page skeleton and semantics

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

**Step 1: Add semantic page landmarks**

Implement:
- skip link near the start of `body`
- `main` wrapper for page content
- clearer metadata support in `head` if needed

**Step 2: Remove broken navigation assumptions**

Implement:
- remove or replace `/archive` link until the route exists
- ensure "back to top" targets the actual top anchor

**Step 3: Rebuild the high-level section order**

Implement sections in this order:
- `Global Rail`
- `Signal Deck`
- `Top Signals`
- `Category Sweep`
- `Community Pulse`
- `Source Ledger`

**Step 4: Run build verification**

Run: `npm run build`
Expected: PASS with the homepage route rendering cleanly

**Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "refactor: rebuild homepage structure and semantics"
```

### Task 3: Replace the current hero with the new Signal Deck

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

**Step 1: Shape page data for hero summary**

Implement page-level derived values for:
- primary signal
- concise intelligence summary
- active category totals
- source coverage summary

**Step 2: Render the new `Signal Deck`**

Implement:
- title and date block
- update status
- metrics strip
- primary signal panel

**Step 3: Increase hero glow without polluting content zones**

Implement:
- stronger background glow and atmospheric layering
- localized glow around the primary signal panel
- restrained text treatments in foreground content

**Step 4: Run build verification**

Run: `npm run build`
Expected: PASS and no missing variables or invalid Astro template output

**Step 5: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: add industrial signal deck hero"
```

### Task 4: Normalize article card behavior

**Files:**
- Modify: `src/components/ui/ReportCard.astro`
- Modify: `src/pages/index.astro`

**Step 1: Define one consistent click model**

Implement:
- entire card clickable where feasible
- remove mixed title-only vs button-only patterns
- preserve accessible link names

**Step 2: Add visual hierarchy states**

Implement:
- variant styling for primary, sweep, and compact cards
- clearer source/time/tag ordering
- compact fallback when summaries are empty

**Step 3: Improve image fallback and alt behavior**

Implement:
- meaningful alt text policy for article imagery
- polished no-image fallback treatment

**Step 4: Run build verification**

Run: `npm run build`
Expected: PASS with no duplicate-link or invalid nesting issues

**Step 5: Commit**

```bash
git add src/components/ui/ReportCard.astro src/pages/index.astro
git commit -m "refactor: normalize signal card behavior"
```

### Task 5: Build the `Top Signals` section

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Reshape featured content selection**

Implement:
- one dominant signal
- supporting signals ranked beneath or beside it
- no confusing duplication between top slots where avoidable

**Step 2: Render ranked signal layout**

Implement:
- clear positional priority
- stronger label treatment
- direct scan of title, source, time, and tags

**Step 3: Ensure responsive collapse**

Implement:
- desktop asymmetry
- tablet simplification
- mobile single-column order preserving priority

**Step 4: Run build verification**

Run: `npm run build`
Expected: PASS and clean responsive class structure

**Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add top signals section"
```

### Task 6: Build the `Category Sweep` with light interaction

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

**Step 1: Reshape category data**

Implement:
- normalized category config with label, icon, count, and item list
- "all" view for default overview

**Step 2: Render sweep controls**

Implement:
- compact segmented control or tab strip
- active state and count visibility

**Step 3: Add light interaction**

Implement small client-side behavior for:
- switching active category
- preserving accessible button semantics
- optional simple URL hash sync if low-cost

**Step 4: Keep no-JS fallback acceptable**

Implement:
- default "all" state visible in static output
- avoid hiding all content before hydration

**Step 5: Run build verification**

Run: `npm run build`
Expected: PASS and functional default rendering in static output

**Step 6: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: add interactive category sweep"
```

### Task 7: Rebuild `Community Pulse` as a distinct signal band

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

**Step 1: Separate community visual language**

Implement:
- banded or strip-like layout
- distinct accent treatment from article cards
- consistent link affordance

**Step 2: Reduce visual equivalence with source articles**

Implement:
- discussion-style metadata presentation
- tighter summaries
- clear "discussion" tone

**Step 3: Run build verification**

Run: `npm run build`
Expected: PASS and community visuals remain distinct in markup and styling

**Step 4: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "refactor: redesign community pulse band"
```

### Task 8: Add the `Source Ledger` and metadata surfacing

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Surface existing metadata**

Implement:
- editor note / generated note
- source distribution snapshot
- category coverage indicators

**Step 2: Render a low-noise footer intelligence section**

Implement:
- compact source chips or bars
- simple explanatory copy
- stronger closing rhythm than the current plain footer

**Step 3: Run build verification**

Run: `npm run build`
Expected: PASS and metadata is visible without overcrowding the page

**Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add source ledger metadata section"
```

### Task 9: Tighten accessibility and visual polish

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/components/ui/ReportCard.astro`
- Modify: `src/styles/global.css`

**Step 1: Fix semantic and focus issues**

Implement:
- skip link
- `main` landmark
- focus-visible polish
- meaningful button and link labels

**Step 2: Raise weak contrast areas**

Implement:
- revisit muted text tokens
- adjust footer and tertiary text usage
- ensure active controls remain readable

**Step 3: Verify reduced motion**

Implement:
- keep current reduced-motion support
- ensure any new interactive transitions also respect it

**Step 4: Run build verification**

Run: `npm run build`
Expected: PASS and no broken focus or motion regressions

**Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro src/components/ui/ReportCard.astro src/styles/global.css
git commit -m "fix: improve homepage accessibility and polish"
```

### Task 10: Final verification

**Files:**
- Review: `src/layouts/BaseLayout.astro`
- Review: `src/pages/index.astro`
- Review: `src/components/ui/ReportCard.astro`
- Review: `src/styles/global.css`

**Step 1: Run production build**

Run: `npm run build`
Expected: PASS

**Step 2: Review output footprint**

Run: `find dist -maxdepth 2 -type f | sort`
Expected: expected static assets and homepage output only

**Step 3: Manual QA checklist**

Verify:
- hero has stronger atmospheric glow
- sticky rail appears on scroll
- category sweep is fast to use
- cards behave consistently
- no broken links remain
- mobile layout preserves priority order

**Step 4: Final commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro src/components/ui/ReportCard.astro src/styles/global.css
git commit -m "feat: ship industrial homepage redesign"
```
