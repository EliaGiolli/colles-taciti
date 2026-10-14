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

PR: [#1](https://github.com/EliaGiolli/colles-taciti/pull/1) · Merged: 2026-10-14 · Notes: TypeScript
kept on 6.x; Fonts API stable (Fontsource + fontaine dropped); Biome + Prettier split; vue-tsc on its
own tsconfig; `.astro` tests in Node env. The two Vercel notes landed after the merge and were carried
into PR 1. See `docs/PLAN.md` › change log.

- [x] Git repository + private GitHub repo `colles-taciti`, empty initial commit on main
- [x] `docs/PLAN.md` (copy of the brief + change log); brief kept locally and gitignored
- [x] `CLAUDE.md`
- [x] `ROADMAP.md`
- [x] `README.md` (badges, stack icons, sections)
- [x] Skill / plugin / MCP search: proposal to Elia, install only what is approved, list in `CLAUDE.md` → Tooling (`.mcp.json`: astro-docs, context7, playwright)
- [x] Version checks (Fonts API, Container API, Biome on `.astro`/`.vue`, `strictest` tsconfig), outcome in `docs/PLAN.md`
- [x] `.gitattributes` (`* text=auto eol=lf`)
- [x] Astro 7 minimal setup, Bun (exact versions via `bunfig.toml`), TS strictest + `noPropertyAccessFromIndexSignature`, `@/core` `@/features` `@/shared` `@tests` aliases
- [x] `@astrojs/vercel` adapter, `@astrojs/vue` integration, provisional `site`, `trailingSlash: "never"`
- [x] `core/controllers/registry.ts` (lazy `import()` per `[data-controller]`, discovered via `import.meta.glob`) + 25 unit tests
- [x] Biome (`.ts`/`.js`/`.css`/`.json`) + Prettier with prettier-plugin-astro (format `.astro`/`.vue` only) and dependency-cruiser rules (verified with deliberate violations)
- [x] lefthook pre-commit (`typecheck` + `lint` + unit) and pre-push (`check` + e2e)
- [x] Vitest (unit + integration projects, `getViteConfig`, Container API helper), v8 coverage reported
- [x] Playwright + axe, smoke e2e test (desktop + 375px)
- [x] `.env.example`, VS Code recommended extensions and settings
- [x] GitHub Actions on every PR (typecheck, lint, unit, integration, build, e2e), coverage comment on the PR
- [x] Vercel linked for PR previews (with Elia's confirmation): project `colles-taciti`, Git integration on
- [x] README updated

## PR 1 · `feat/design-tokens`

PR: – · Merged: – · Notes: –

- [x] `styles/app.css` from the artifact tokens (Notte and Nebbia on `[data-theme]`, `@theme inline`, dark custom variant); Tailwind default scales reset (no off-palette colours, no shadows, no radii, DS spacing only)
- [x] Nebbia weights as theme tokens (`--peso-*`, read by every `text-*` style); no radius, no shadows
- [x] Fonts via the Astro Fonts API (Google provider, self-hosted, `opsz` axis), Latin subset, preload Literata regular only
- [x] Shared cva variants in `shared/variants/*.ts` (button, field, label)
- [x] `Button`, `Field`, `Label` (`.astro`) + `BaseButton.vue`, `BaseInput.vue`, with tests (Container API / Vue Testing Library)
- [x] `shared/lib`: `cn()` (tailwind-merge taught the DS scales), `formatDate` / `toIsoDate` (Europe/Rome), plurals, text normalisation
- [x] Token-sync test (app.css ↔ design-tokens.ts) and «carne/ruggine/crete never as text» check
- [x] `/design-system` page (noindex) + `styleguide-theme` controller (`?tema=nebbia`); e2e: axe in Notte and Nebbia, self-hosted fonts
- [x] README updated

## PR 2 · `feat/layout-theme`

PR: – · Merged: – · Notes: –

- [ ] `BaseLayout` (reuses `core/layout/GlobalHead.astro`), `Header` (Racconti · Libri), `Footer`, `Brand`
- [ ] Favicon (today a 404 in the browser console)
- [ ] Decide with Elia: the DS says the theme follows `prefers-color-scheme` until the reader chooses; the plan says Notte by default
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
- [ ] CSP: hashes for Astro's inlined scripts, or `assetsInlineLimit: 0` (see PLAN change log)
- [ ] Decide whether `/design-system` stays public (it is `noindex`)
- [ ] Final touches
- [ ] README updated

---

## Open points

- [x] GitHub repository name and visibility (`colles-taciti`, private)
- [x] Vercel link (project `colles-taciti`, linked with the CLI, previews on every PR)
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
