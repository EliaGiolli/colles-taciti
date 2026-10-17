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

PR: [#9](https://github.com/EliaGiolli/colles-taciti/pull/9) · Merged: 2026-10-16 · Notes: no-JS
submissions go to the on-demand `/feedback` page; Vercel function in `dub1` next to the database;
e2e built with the Node adapter on a throwaway `e2e.db`; database MCP not needed for now. See
`docs/PLAN.md` › change log.

- [x] Turso database (created by Elia, `aws-eu-west-1`) + Drizzle `feedback` table + migrations (applied)
- [x] Evaluate a database MCP (e.g. read-only libSQL) and propose it to Elia (proposed in the PR: not needed for now)
- [x] Astro Action (`accept: "form"`, zod), honeypot, Resend, `delivered` update
- [x] `FeedbackForm.astro` + controller (works without JS, through the on-demand `/feedback` page)
- [x] DB tests on libSQL `:memory:`; MSW for Resend; e2e on a throwaway `e2e.db` (Node adapter)
- [x] README updated

## PR 8 · `feat/seo`

PR: [#10](https://github.com/EliaGiolli/colles-taciti/pull/10) · Merged: 2026-10-16 · Notes: canonical
without query string; preview image = story cover; robots.txt and sitemap generated at build. The
homepage Hero photo landed afterwards directly on `main` (Elia's request). See `docs/PLAN.md`.

- [x] `Seo.astro` (title, meta, canonical, og:image)
- [x] JSON-LD: `WebSite` + `Person`, `ShortStory` (+ `CreativeWorkSeries`), `CollectionPage`
- [x] `@astrojs/sitemap`, `robots.txt`
- [x] README updated

## PR 9 · `feat/consent-analytics`

PR: [#11](https://github.com/EliaGiolli/colles-taciti/pull/11) · Merged: 2026-10-17 · Notes: gtag.js is
not loaded before consent (stricter than the standard snippet); Consent Mode v2 default denied,
analytics only; «Preferenze cookie» in the footer; fake GA ID and intercepted Google requests in e2e.
Banner and feedback e-mail confirmed working in production by Elia. See `docs/PLAN.md` › change log.

- [x] Consent Mode v2 (default denied), gtag loader, `ConsentBanner` + controller, «Preferenze cookie» in the footer
- [x] `track()` with typed events: `story_start`, `story_finish`, `feedback_submit`, `wattpad_click`, `resume_reading`
- [x] No GA request before consent (e2e)
- [x] UTM conventions in README
- [x] README updated

## PR 10 · `feat/books`

PR: [#12](https://github.com/EliaGiolli/colles-taciti/pull/12) · Merged: 2026-10-17 · Notes: 24 books,
not 23; Open Library instead of Google Books, with `originalTitle` for Italian editions and seven
years fixed by hand; one generic island with ranks computed at build time; fear-page intros as
`[Segnaposto]` drafts, liminal video still missing. See `docs/PLAN.md` › change log.

Changed with Elia on 2026-10-17: his real list instead of test data; the personal note becomes
optional (no SEO goal for /libri); no «tag» facet; films postponed to after launch; intros and
The Horror Scriptorium videos on the fear pages folded in here.

- [x] `books.json` with Elia's 24 books (20 horror, 4 on writing: the list counted 23 and 19); `note` optional in the schema; `originalTitle` for the search
- [x] Open Library client + `libri:sync`: year, work link and cover in `public/libri`, never overwriting hand-written fields (wrong years fixed by hand after the run)
- [x] Generic search island (`kind: stories | books`): book facets section/author/decade, sort by author (default), title or year; prefix search without a MiniSearch index
- [x] `BookItem.vue` (DS Libro with cover, black and white to colour on hover) and `/libri` with the DS shelf as Hero
- [x] Fear pages: one intro paragraph (draft marked `[Segnaposto]`) and a link to the subgenre's video on The Horror Scriptorium (no `nofollow`; not on Esperimenti)
- [x] Tests: MSW for Open Library, e2e /libri (axe, facets, URL, back button)
- [x] README updated

## PR 11 · `refactor/src-structure`

PR: [#13](https://github.com/EliaGiolli/colles-taciti/pull/13) · Merged: 2026-10-17 · Notes: moves
only, imports rewritten with the TypeScript parser; `core/analytics`, `core/config`, `core/db` stay
flat; Markdown plugins in `features/stories/markdown/`; the structure test cannot tell constants from
helpers, so that part is left to review. See `docs/PLAN.md` › change log.

Added with Elia on 2026-10-17: every feature and `core` module groups its files by kind, so
constants and helpers no longer sit scattered next to components. Moves only, no behaviour change.

- [x] Subfolders by kind: `components/`, `controllers/`, `composables/`, `constants/`, `helpers/`, `server/`; `index.ts`, `client.ts`, `copy.ts`, `schema.ts` stay at the root
- [x] Split the files that mix constants and functions (`theme.ts`, `nav.ts`, `brand-tone.ts`, `registry.ts`, `feedback/schema.ts` and `notify.ts`…)
- [x] `shared/lib` → `shared/helpers`, new `shared/constants` (design tokens, locale)
- [x] `git mv` for every move; imports rewritten in `src`, `tests`, `scripts` and the configs
- [x] Structure test (`tests/integration/structure.test.ts`): components, controllers, composables and server-only modules in their folders
- [x] CLAUDE.md › Architecture, README and PLAN trees updated (README updated)

## PR 12 · `chore/launch`

PR: [#14](https://github.com/EliaGiolli/colles-taciti/pull/14) · Merged: 2026-10-17 · Notes: CSP through
Astro's `security.csp` instead of `assetsInlineLimit: 0`; markdown highlighting off; `/design-system`
injected only in dev and e2e; Vitest down to 2 local workers. Lighthouse performance measured on
production after the merge (previews are behind Vercel Authentication). See `docs/PLAN.md` › change log.

- [x] Error pages: static `404.astro` (no JS, heading in the site's voice, «Scegli la tua paura») and `500.astro` for what runs on demand (`/feedback`, the Action; the error is never shown), with the DS brand illustration (`brandArtSvg`) as image
- [x] Environment variables on Vercel (added by Elia on 2026-10-17: Turso, Resend, GA4, Production only)
- [x] Lighthouse mobile on production (2026-10-17): home 94 / 100 / 100 / 100, *Il limbo dei processi* 91 / 100 / 100 / 100 (performance, accessibility, best practices, SEO); LCP 1.6 s and 2.6 s, CLS 0. Speed Index 6.4 s, probably the consent banner appearing after load. One label-in-name fix along the way
- [x] CSP: Astro's `security.csp` (hashes of every inline script and style, no `'unsafe-inline'`), GA4 hosts only; `frame-ancestors` and other headers in `vercel.json`; e2e on CSP violations
- [x] `/design-system` out of production (Elia's decision, 2026-10-17): route injected only with `astro dev` and in the e2e build
- [ ] Final touches
- [x] README updated (error pages, security headers, `/design-system` in dev and e2e only)

---

## Open points

- [x] GitHub repository name and visibility (`colles-taciti`, private)
- [x] Vercel link (project `colles-taciti`, linked with the CLI, previews on every PR)
- [x] Turso account
- [ ] Domain
- [ ] SEO title and description of /racconti (`features/search/copy.ts`) and of the five fear pages (`seo` in `fears.json`): written in PR 6 on the SEO brief's pattern, to be checked by Elia against the brief
- [ ] Real texts, fear notes, warnings, dates and tags for each story (placeholders marked `[Segnaposto]` in `src/core/content/stories`)
  - 2026-10-17: first real story, *Al cuore non si comanda* (Esperimenti); *Le vibrazioni* moved to Esperimenti as its main fear, with its final fear note (text still a placeholder)
- [ ] Wattpad addresses of Le vibrazioni and Senza Rimorso (`wattpadUrl` in their frontmatter)
- [x] Photo `abat-jour-notte.jpg` in the homepage Hero (`src/assets/foto`, optimised by `astro:assets`)
- [x] Books list (sent by Elia on 2026-10-17)
- [x] Portfolio and Wattpad URLs (`core/layout/nav.ts`)
- [ ] Instagram profile: when it exists, add its link to `EXTERNAL_LINKS` and the footer
- [x] Resend and GA4 keys
- [ ] Rewrite the intros of the four fear pages (remove `[Segnaposto]` in `fears.json`)
- [ ] The Horror Scriptorium video on liminal horror (body horror, psychological and slasher received): `watch` in `fears.json`
- [ ] Confirm «Chtulu (Lovecraft)» as *Il richiamo di Cthulhu* in `books.json` (or name the right book)
- [ ] Optional personal notes on the books (`note` in `books.json`)

## After launch

- [ ] Place pages (when a place has ≥2 stories)
- [ ] `/en/`
- [ ] Newsletter
- [ ] Sentry
- [ ] Pagefind
- [ ] Horror films (decided with Elia: not at launch)
