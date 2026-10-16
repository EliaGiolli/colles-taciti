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

PR: [#2](https://github.com/EliaGiolli/colles-taciti/pull/2) · Merged: 2026-10-14 · Notes: Tailwind
default scales reset (only DS values exist); Nebbia weights as tokens; fonts self-hosted by the Fonts
API; Vue components named `Base*`; Vitest and Playwright worker limits for the low-memory dev machine.
See `docs/PLAN.md` › change log.

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

PR: [#3](https://github.com/EliaGiolli/colles-taciti/pull/3) · Merged: 2026-10-15 · Notes: Notte always
by default (system preference ignored); toggle with two `aria-pressed` buttons; anti-flash script fed by
`define:vars`; `styleguide-theme` controller removed; Bodoni «C» favicon; skip link. Footer links fixed
afterwards in PR 3 (Instagram omitted until the profile exists). See `docs/PLAN.md` › change log.

- [x] `BaseLayout` (reuses `core/layout/GlobalHead.astro`), `Header` (Racconti · Libri), `Footer`, `Brand`
- [x] Favicon (today a 404 in the browser console): Bodoni «C» as SVG outlines, `public/favicon.svg`
- [x] Decided with Elia (2026-10-14): Notte by default, always; `prefers-color-scheme` is not followed, the reader switches with the toggle
- [x] Anti-flash theme script (`is:inline`) + `ThemeToggle` + `theme-toggle.controller.ts`
- [x] Native cross-document View Transitions; `prefers-reduced-motion` turns everything off
- [x] README updated

## PR 3 · `feat/content-pipeline`

PR: [#5](https://github.com/EliaGiolli/colles-taciti/pull/5) · Merged: 2026-10-15 · Notes: includes the footer-link
fix (closed #4). Sätteri mdast plugin instead of remark (Astro 7 default); `readingTime` computed from the
text; content in `src/core/content/` next to the brand-tone check; content tests read the files directly
(`getCollection` is empty inside Vitest). See `docs/PLAN.md` › change log.

- [x] Footer links: real portfolio and Wattpad URLs, no Instagram link until the profile exists (was the separate PR #4, folded in here)
- [x] `content.config.ts`: `stories`, `tags`, `fears`, `books` collections with the full frontmatter schema (content in `src/core/content/`, next to the brand-tone check)
- [x] Plugin for ```` ```chat ```` / ```` ```log ```` blocks: a Sätteri mdast plugin (Astro 7's default Markdown processor) instead of `remark-ct`
- [x] Placeholder stories (3 complete + Senza Rimorso ongoing): real metadata from the SEO brief, placeholder text and fear notes
- [x] Queries in `features/stories`, with a cross-entry integrity check (tags in the right group, existing references, starter positions)
- [x] Brand-tone check (no `!`, emoji, shouting caps, banned names in `seo`/`title`/`logline`/`tags`), enforced by the schemas through `publicCopy()`
- [x] README updated

## PR 4 · `feat/story-page`

PR: [#6](https://github.com/EliaGiolli/colles-taciti/pull/6) · Merged: 2026-10-15 · Notes: covers, story
page and reading progress in one PR (they were PRs 4, 5 and 6). resvg needs static font instances
(`scripts/fonts`); a 1600×640 band format for the Hero; optional `cover` frontmatter field; chapter
anchors from a second Sätteri plugin; `StoryCard.vue` brought forward from PR 6; «finished» when the fear
note reaches the reading line. See `docs/PLAN.md` › change log.

Covers
- [x] `cover.ts` (pure SVG) + `Cover.astro` (four formats, including the 1600×640 band for the Hero; optional `cover` frontmatter override)
- [x] `copertine` script: PNG via resvg (1200×630, 512×800, 1080×1350), static font instances in `scripts/fonts`, hash manifest checked by a test

Story page
- [x] `/racconti/[slug]`: Hero (with the cover), StoryFacts (tags link to filters), ChapterIndex (`#capitolo-N`, set by a second Sätteri plugin)
- [x] `Prose`, `LiveChat`, `LogLines`, `FearNote`, `OngoingBanner` (styles for the `ct-chat`/`ct-log`/`ct-glitch` markup the PR 3 plugin already emits, in app.css › Story components)
- [x] `ReadingControls` + `reading-controls.controller.ts`
- [x] «Se ti è piaciuto» + Wattpad link (with `StoryCard.vue`, brought forward from PR 6)

Reading progress
- [x] `reading-progress.controller.ts` + storage (story, chapter, %) in `localStorage`
- [x] `ResumeLine` («Eri al capitolo N → Riprendi») and `ContinueReading` (placed on the homepage in PR 5)

- [x] README updated

## PR 5 · `feat/home`

PR: [#7](https://github.com/EliaGiolli/colles-taciti/pull/7) · Merged: 2026-10-15 · Notes: Hero with
the DS brand illustration until the photo arrives; «Inizia a leggere» opens the first starter story;
«Ultimi racconti» leaves ongoing stories out (they have the InCorso banner); cover variant of
`StoryCard.vue` brought forward from PR 6; «Chi sono →» dropped. See `docs/PLAN.md` › change log.

- [x] Hero, «Stai leggendo…» (`ContinueReading`, built in PR 4), intro, «Da dove cominciare», «Ultimi racconti», InCorso
- [x] SceltaPaura with counts, «Perché Colles Taciti», form slot
- [x] `StoryCard.vue` cover-thumbnail variant (`ct-scheda--copertina`) for «Ultimi racconti» (was listed under PR 6)
- [x] README updated

## PR 6 · `feat/search-filters`

PR: [#8](https://github.com/EliaGiolli/colles-taciti/pull/8) · Merged: 2026-10-16 · Notes: «ispirazione»
facet added (story pages already linked to it); relevance sort while searching; `zod/mini` in the
island; `features/stories/client.ts` as browser-safe API; vue-tsc `fallthroughAttributes`. See
`docs/PLAN.md` › change log.

- [x] Prerendered `search-index.json` endpoint (`buildIndex`): MiniSearch's serialised index of metadata and incipit, loaded in the browser with MiniSearch itself on first use
- [x] `SearchBrowser.vue` island (`client:idle`, MiniSearch, facets incl. «ispirazione», `TransitionGroup`, `aria-live` count), `BaseFacetChip.vue` on /design-system
- [x] `useUrlState` composable (`zod/mini` ↔ URLSearchParams), back button works
- [x] `/racconti` (the island rendered on the server is the static list) and the 5 `/[categoria]` pages, with `seo` texts in `fears.json`
- [x] `StoryCard.vue` (created in PR 4, cover variant in PR 5) used in the archive, the island and the fear pages
- [x] `features/stories/client.ts`: browser-safe public API, guarded by a dependency-cruiser rule
- [x] README updated

## PR 7 · `feat/feedback`

PR: – · Merged: – · Notes: –

- [x] Turso database (created by Elia, `aws-eu-west-1`) + Drizzle `feedback` table + migrations (applied)
- [x] Evaluate a database MCP (e.g. read-only libSQL) and propose it to Elia (proposed in the PR: not needed for now)
- [x] Astro Action (`accept: "form"`, zod), honeypot, Resend, `delivered` update
- [x] `FeedbackForm.astro` + controller (works without JS, through the on-demand `/feedback` page)
- [x] DB tests on libSQL `:memory:`; MSW for Resend; e2e on a throwaway `e2e.db` (Node adapter)
- [x] README updated

## PR 8 · `feat/seo`

PR: – · Merged: – · Notes: –

- [ ] `Seo.astro` (title, meta, canonical, og:image)
- [ ] JSON-LD: `WebSite` + `Person`, `ShortStory` (+ `CreativeWorkSeries`), `CollectionPage`
- [ ] `@astrojs/sitemap`, `robots.txt`
- [ ] README updated

## PR 9 · `feat/consent-analytics`

PR: – · Merged: – · Notes: –

- [ ] Consent Mode v2 (default denied), gtag loader, `ConsentBanner` + controller
- [ ] `track()` with typed events: `story_start`, `story_finish`, `feedback_submit`, `wattpad_click`, `resume_reading`
- [ ] No GA request before consent (e2e)
- [ ] UTM conventions in README
- [ ] README updated

## PR 10 · `feat/books`

PR: – · Merged: – · Notes: –

- [ ] Open Library / Google Books client + `libri:sync`
- [ ] `/libri`: Shelf, `BookItem.vue`, island with section/author/decade/tag facets, mandatory note
- [ ] Test data until Elia's list arrives
- [ ] README updated

## PR 11 · `chore/launch`

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
- [x] Turso account
- [ ] Domain
- [ ] SEO title and description of /racconti (`features/search/copy.ts`) and of the five fear pages (`seo` in `fears.json`): written in PR 6 on the SEO brief's pattern, to be checked by Elia against the brief
- [ ] Real texts, fear notes, warnings, dates and tags for each story (placeholders marked `[Segnaposto]` in `src/core/content/stories`)
- [ ] Wattpad addresses of Le vibrazioni and Senza Rimorso (`wattpadUrl` in their frontmatter)
- [ ] Photo `abat-jour-notte.jpg` (the homepage Hero shows the DS brand illustration until it arrives)
- [ ] Books list
- [x] Portfolio and Wattpad URLs (`core/layout/nav.ts`)
- [ ] Instagram profile: when it exists, add its link to `EXTERNAL_LINKS` and the footer
- [ ] Resend and GA4 keys

## After launch

- [ ] Place pages (when a place has ≥2 stories)
- [ ] `/en/`
- [ ] Newsletter
- [ ] Sentry
- [ ] Pagefind
