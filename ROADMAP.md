# Roadmap

Living checklist for Colles Taciti. Decisions live in [docs/PLAN.md](docs/PLAN.md).

**Rules**
- At the start of every session, resume from the first unchecked task.
- Tick a task only when the code is written, its tests pass and `bun run check` is green.
- Update this file in the PR that completes the task.
- If a task changes compared to the plan, update `docs/PLAN.md` too (change log).
- When a PR is merged, fill in its link, merge date and notes («what changed compared to the plan»).

---

## PR 0 · `chore/bootstrap`

PR: – · Merged: – · Notes: –

- [x] Git repository + private GitHub repo `colles-taciti`, empty initial commit on main
- [x] `docs/PLAN.md` (copy of the brief + change log); brief kept locally and gitignored
- [x] `CLAUDE.md`
- [x] `ROADMAP.md`
- [x] `README.md` (badges, stack icons, sections)
- [x] Skill / plugin / MCP search: proposal to Elia, install only what is approved, list in `CLAUDE.md` → Tooling (`.mcp.json`: astro-docs, context7, playwright)
- [x] Version checks (Fonts API, Container API, Biome on `.astro`/`.vue`, `strictest` tsconfig), outcome in `docs/PLAN.md`
- [ ] `.gitattributes` (`* text=auto eol=lf`)
- [ ] `create astro` (minimal template), Bun, TS strictest + `noPropertyAccessFromIndexSignature`, `@/core` `@/features` `@/shared` aliases
- [ ] `@astrojs/vercel` adapter, `@astrojs/vue` integration, provisional `site`
- [ ] `core/controllers/registry.ts` (lazy `import()` per `[data-controller]`) + tests
- [ ] Biome (`.ts`/`.js`/`.css`/`.json`) + Prettier with prettier-plugin-astro (format `.astro`/`.vue` only) and dependency-cruiser rules
- [ ] lefthook pre-commit (`typecheck` + `lint` + unit)
- [ ] Vitest (unit + integration, `getViteConfig`), v8 coverage reported
- [ ] Playwright + axe, smoke e2e test
- [ ] GitHub Actions on every PR (typecheck, lint, unit, integration, build, e2e)
- [ ] Vercel linked for PR previews (with Elia's confirmation)
- [ ] README updated

## PR 1 · `feat/design-tokens`

PR: – · Merged: – · Notes: –

- [ ] `styles/app.css` from the artifact tokens (Notte and Nebbia on `[data-theme]`, `@theme inline`, dark custom variant)
- [ ] Nebbia weights in `@layer base`; no radius, no shadows
- [ ] Fonts via the Astro Fonts API, Latin subset, preload Literata regular
- [ ] Shared cva variants in `shared/variants/*.ts`
- [ ] `Button`, `Field`, `Label` (`.astro`) + minimal Vue equivalents, with tests
- [ ] `shared/lib`: `cn()`, `formatDate` (Europe/Rome), plurals, text normalisation
- [ ] README updated

## PR 2 · `feat/layout-theme`

PR: – · Merged: – · Notes: –

- [ ] `BaseLayout`, `Header` (Racconti · Libri), `Footer`, `Brand`
- [ ] Anti-flash theme script (`is:inline`) + `ThemeToggle` + `theme-toggle.controller.ts`
- [ ] Native cross-document View Transitions; `prefers-reduced-motion` turns everything off
- [ ] README updated

## PR 3 · `feat/content-pipeline`

PR: – · Merged: – · Notes: –

- [ ] `content.config.ts`: `stories`, `tags`, `fears`, `books` collections with the full frontmatter schema
- [ ] `remark-ct` plugin for ```` ```chat ```` / ```` ```log ```` blocks
- [ ] Placeholder stories (3 complete + Senza Rimorso ongoing)
- [ ] Queries in `features/stories`
- [ ] Brand-tone check (no `!`, emoji, shouting caps, banned names in `seo`/`title`/`logline`/`tags`)
- [ ] README updated

## PR 4 · `feat/covers`

PR: – · Merged: – · Notes: –

- [ ] `cover.ts` (pure SVG) + `Cover.astro`
- [ ] `copertine` script: PNG via resvg (1200×630, 512×800, 1080×1350)
- [ ] README updated

## PR 5 · `feat/story-page`

PR: – · Merged: – · Notes: –

- [ ] `/racconti/[slug]`: Hero, StoryFacts (tags link to filters), ChapterIndex (`#capitolo-N`)
- [ ] `Prose`, `LiveChat`, `LogLines`, `FearNote`, `OngoingBanner`
- [ ] `ReadingControls` + `reading-controls.controller.ts`
- [ ] «Se ti è piaciuto» + Wattpad link
- [ ] README updated

## PR 6 · `feat/reading-progress`

PR: – · Merged: – · Notes: –

- [ ] `reading-progress.controller.ts` + storage (story, chapter, %) in `localStorage`
- [ ] `ResumeLine` («Eri al capitolo N → Riprendi») and `ContinueReading`
- [ ] README updated

## PR 7 · `feat/home`

PR: – · Merged: – · Notes: –

- [ ] Hero, «Stai leggendo…», intro, «Da dove cominciare», «Ultimi racconti», InCorso
- [ ] SceltaPaura with counts, «Perché Colles Taciti», form slot
- [ ] README updated

## PR 8 · `feat/search-filters`

PR: – · Merged: – · Notes: –

- [ ] Prerendered `search-index.json` endpoint (`buildIndex`)
- [ ] `SearchBrowser.vue` island (`client:idle`, MiniSearch, facets, `TransitionGroup`, `aria-live`)
- [ ] `useUrlState` composable (zod ↔ URLSearchParams), back button works
- [ ] `/racconti` (static list + island) and the 5 `/[categoria]` pages
- [ ] `StoryCard.vue` used statically and in the island
- [ ] README updated

## PR 9 · `feat/feedback`

PR: – · Merged: – · Notes: –

- [ ] Turso database (with Elia's confirmation) + Drizzle `feedback` table + migrations
- [ ] Evaluate a database MCP (e.g. read-only libSQL) and propose it to Elia
- [ ] Astro Action (`accept: "form"`, zod), honeypot, Resend, `delivered` update
- [ ] `FeedbackForm.astro` + controller (works without JS)
- [ ] DB tests on libSQL `:memory:`; MSW for Resend
- [ ] README updated

## PR 10 · `feat/seo`

PR: – · Merged: – · Notes: –

- [ ] `Seo.astro` (title, meta, canonical, og:image)
- [ ] JSON-LD: `WebSite` + `Person`, `ShortStory` (+ `CreativeWorkSeries`), `CollectionPage`
- [ ] `@astrojs/sitemap`, `robots.txt`
- [ ] README updated

## PR 11 · `feat/consent-analytics`

PR: – · Merged: – · Notes: –

- [ ] Consent Mode v2 (default denied), gtag loader, `ConsentBanner` + controller
- [ ] `track()` with typed events: `story_start`, `story_finish`, `feedback_submit`, `wattpad_click`, `resume_reading`
- [ ] No GA request before consent (e2e)
- [ ] UTM conventions in README
- [ ] README updated

## PR 12 · `feat/books`

PR: – · Merged: – · Notes: –

- [ ] Open Library / Google Books client + `libri:sync`
- [ ] `/libri`: Shelf, `BookItem.vue`, island with section/author/decade/tag facets, mandatory note
- [ ] Test data until Elia's list arrives
- [ ] README updated

## PR 13 · `chore/launch`

PR: – · Merged: – · Notes: –

- [ ] Environment variables on Vercel (with Elia's confirmation)
- [ ] Lighthouse mobile (home + one story): SEO, a11y, performance
- [ ] Final touches
- [ ] README updated

---

## Open points

- [x] GitHub repository name and visibility (`colles-taciti`, private)
- [ ] Vercel link
- [ ] Turso account
- [ ] Domain
- [ ] Real texts, fear notes, warnings, dates and tags for each story
- [ ] Photo `abat-jour-notte.jpg`
- [ ] Books list
- [ ] Resend and GA4 keys

## After launch

- [ ] Place pages (when a place has ≥2 stories)
- [ ] `/en/`
- [ ] Newsletter
- [ ] Sentry
- [ ] Pagefind
