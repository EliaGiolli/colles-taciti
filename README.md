<div align="center">

# Colles Taciti

**Horror stories in Italian, free to read, written to be read slowly.**

<p>
  <img alt="Astro" src="https://img.shields.io/badge/Astro-static-BC52EE?style=flat-square&logo=astro&logoColor=white" />
  <img alt="Vue" src="https://img.shields.io/badge/Vue-search%20island-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strictest-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-1.4-000000?style=flat-square&logo=bun&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-hosting-000000?style=flat-square&logo=vercel&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-all%20rights%20reserved-555555?style=flat-square" />
</p>

<p>
  <img alt="Status" src="https://img.shields.io/badge/status-bootstrap-8A1C1C?style=flat-square" />
</p>

</div>

---

## <img src="https://api.iconify.design/lucide/book-open.svg?color=%23888888" width="22" align="top" alt="" /> About

Colles Taciti is the home of Elia Giolli's horror fiction. The stories are free, indexable by search
engines and built to collect honest feedback from readers. The site sits alongside Wattpad and
Instagram, and hosts one thing that exists only here: **«La paura dietro il racconto»**, a short note on
the real fear behind each story.

The site is in Italian. The code, comments and documentation are in English.

## <img src="https://api.iconify.design/lucide/sparkles.svg?color=%23888888" width="22" align="top" alt="" /> Features

Planned for launch (track progress in [ROADMAP.md](ROADMAP.md)):

- **Single-page stories** with a chapter index, reading controls and «resume where you left off».
- **Two themes**: *Notte* (dark, default) and *Nebbia* (light), with no flash on load.
- **Search and facets** on stories (fear, place, theme, inspiration, form) and books (section,
  author, decade), with one Vue island, fully reflected in the URL.
- **A reading list** at `/libri`: the books behind the stories, with data and covers from
  Open Library, served by the site itself.
- **Feedback form** that works with and without JavaScript.
- **Privacy-first analytics**: GA4 with Consent Mode v2, denied by default.
- **Zero JavaScript by default**: story pages ship only a few tiny TypeScript controllers.
- **Generated covers** and social images for every story.
- **Self-hosted fonts** (Bodoni Moda, Literata, IBM Plex Mono) through Astro's Fonts API: no
  request to third-party font services.

## <img src="https://api.iconify.design/lucide/layers.svg?color=%23888888" width="22" align="top" alt="" /> Tech stack

<p align="center">
  <a href="https://skillicons.dev">
    <img alt="Astro, Vue, TypeScript, Tailwind, Bun, Vercel, Vitest, SQLite, GitHub Actions" src="https://skillicons.dev/icons?i=astro,vue,ts,tailwind,bun,vercel,vitest,sqlite,githubactions" />
  </a>
</p>

<p align="center">
  <img alt="Turso" src="https://img.shields.io/badge/Turso-libSQL-4FF8D2?style=flat-square&logo=turso&logoColor=black" />
  <img alt="Drizzle" src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black" />
  <img alt="Resend" src="https://img.shields.io/badge/Resend-email-000000?style=flat-square&logo=resend&logoColor=white" />
  <img alt="Zod" src="https://img.shields.io/badge/Zod-schemas-3E67B1?style=flat-square&logo=zod&logoColor=white" />
  <img alt="Biome" src="https://img.shields.io/badge/Biome-lint-60A5FA?style=flat-square&logo=biome&logoColor=white" />
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-e2e-2EAD33?style=flat-square" />
  <img alt="Google Analytics" src="https://img.shields.io/badge/GA4-consent%20mode-E37400?style=flat-square&logo=googleanalytics&logoColor=white" />
</p>

| Area | Choice |
|---|---|
| Framework | Astro, static output, `@astrojs/vercel` |
| Interactivity | Plain TypeScript controllers (`data-controller`); one Vue island for search |
| Content | Astro Content Collections (Markdown + zod, controlled tag vocabulary), Sätteri Markdown processor |
| Styling | Tailwind v4 + cva + clsx + tailwind-merge, design-system tokens in `@theme` |
| Feedback | Astro Action + Turso (libSQL) + Drizzle + Resend, honeypot protection |
| Search | MiniSearch, index generated at build time |
| Quality | `astro check`, `vue-tsc`, Biome, Prettier (`.astro`/`.vue` formatting), dependency-cruiser, lefthook, brand-tone check |
| Tests | Vitest (Container API, Testing Library, jsdom), Playwright + axe |

## <img src="https://api.iconify.design/lucide/network.svg?color=%23888888" width="22" align="top" alt="" /> Architecture

Feature-based layout. `src/pages` only wires things together.

```text
src/
  pages/        thin route files
  core/         app-wide infrastructure: layout, theme, content (stories, vocabularies, brand-tone check), consent, analytics, SEO, db, controllers
  features/     stories, search, categories, covers, books, feedback, home
  shared/       UI primitives, cva variants, helpers, constants
tests/          integration, e2e, fixtures
docs/           PLAN.md (decisions)
```

Inside every feature and `core` module, files are grouped by kind:

```text
features/feedback/
  index.ts  copy.ts  schema.ts    the contracts, at the root
  components/   FeedbackForm.astro
  controllers/  feedback-form.controller.ts
  constants/    fields.ts  limits.ts  paths.ts  email.ts
  helpers/      notify.ts
  server/       action.ts  table.ts  submit.ts  resend.ts
```

`composables/` holds Vue composables, and `server/` holds whatever must never reach the browser
(content queries, the Action, the database table, external API clients). A test
(`tests/integration/structure.test.ts`) keeps components, controllers, composables and server-only
modules in their folders.

Dependency rules, enforced by dependency-cruiser:

- `shared` imports from nobody.
- `core` imports only from `shared`.
- `features/*` import from `core` and `shared`, and from another feature only through its `index.ts`
  (or its `client.ts`, the browser-safe part: no `astro:content`, checked transitively from every
  `.vue` file).

The full design rationale lives in [docs/PLAN.md](docs/PLAN.md) (Italian).

### Design tokens

All colours, type styles, spacing and radii come from the Colles Taciti design system and live in
[`src/styles/app.css`](src/styles/app.css), exposed to Tailwind with `@theme inline`. Tailwind's
default scales are reset, so only design-system values exist (`bg-terra`, `text-lettura`,
`max-w-misura`, `p-5` = 24px), and there are no shadows or rounded utilities. Two themes, *Notte*
and *Nebbia*, switch with `data-theme` on `<html>`. The shared components are shown at
`/design-system`, which exists only with `bun run dev` and in the end-to-end build, never in
production (an integration in `astro.config.ts` adds the route).

### Layout and theme

Every page renders inside [`BaseLayout`](src/core/layout/components/BaseLayout.astro): header (wordmark,
Racconti · Libri, theme switch), `<main>`, footer, and a skip link for keyboard users.

- **Notte is the default for everyone**; the operating system's `prefers-color-scheme` is
  deliberately ignored. The reader picks *Nebbia* with the switch in the header, and the choice is
  saved in `localStorage` (`colles-taciti:tema`).
- A tiny inline script in `<head>` applies the saved theme before the first paint, so there is no
  flash of the wrong theme. Its constants come from [`theme.ts`](src/core/theme/constants/theme.ts) through
  `define:vars`. Without JavaScript the switch is hidden and the page stays in Notte.
- Navigating between pages uses native cross-document **View Transitions** (a 200ms cross-fade,
  CSS only), disabled entirely for readers who prefer reduced motion.

### Content

The stories and vocabularies live in [`src/core/content/`](src/core/content), next to the brand-tone check, and are loaded as Astro
Content Collections ([`src/content.config.ts`](src/content.config.ts)):

| Collection | Source | Notes |
|---|---|---|
| `stories` | `src/core/content/stories/<slug>.md` | One file per story; the file name is the URL slug |
| `fears` | `src/core/content/fears.json` | The five categories (`/body-horror`, `/slasher`…) |
| `tags` | `src/core/content/tags.json` | Controlled vocabulary: places, themes, inspirations |
| `books` | `src/core/content/books.json` | Elia's reading list, completed by `libri:sync` (see [Books](#books)) |

- **Validation**: every entry is checked by a zod schema when `astro check` or the build runs. A
  missing field, a misspelt tag or a fear note outside 80–150 words stops the build with the file
  and the field named. The queries in `src/features/stories` also check the entries against each
  other (tags in the right group, related stories that exist).
- **Brand-tone check**: public copy (titles, labels, loglines, SEO fields, tag and fear names) must
  have no `!`, no emoji, no shouted capitals and no real names from the Monster of Florence case
  ([`brand-tone.ts`](src/core/content/helpers/brand-tone.ts)).
- **Chat and log blocks**: inside a story, a fenced block with the language `chat` or `log`
  becomes the design system's live chat or log lines. The Sätteri plugin that handles them is in
  [`src/features/stories/blocks`](src/features/stories/blocks).

  ````md
  ```chat spettatori=1204
  23:41 dannyboi_88: ma è vero sangue?
  -- dannyboi_88 ha lasciato la chat
  !! La diretta è stata interrotta.
  ```

  ```log etichetta="Log del sistema"
  [06:12:04] INFO  legacy.boot(): avvio processo notturno
  ~~ [06:12:11] ERR   body.handover(): corpo non trovato
  ```
  ````

  In a chat, `--` marks a system line and `!!` the line that breaks the scene. In a log, `ERR`
  lines are errors, `~ ` adds a static glitch and `~~ ` the live one (at most one per block).
- The launch stories are **placeholders**: their metadata comes from the SEO brief, but the text
  and the fear notes are marked `[Segnaposto]` until the real ones arrive.

### Homepage

The homepage ([`src/pages/index.astro`](src/pages/index.astro)) follows the SEO brief's copy and the
mockup: a Hero (the design system's brand illustration until the photo `abat-jour-notte.jpg`
exists), «Stai leggendo» for a reader with a story left half-way, the introduction, «Da dove
cominciare» (three stories picked for newcomers, set with `starter` in their frontmatter), «Ultimi
racconti» (the newest stories with their covers, ongoing ones left out), the InCorso banner for
the story still coming out, «Scegli la tua paura» with story counts, and «Perché Colles Taciti».
Like the story pages it ships no framework: only the theme switch and the «Stai leggendo»
controller.

### Archive and fear pages

`/racconti` ([`src/pages/racconti/index.astro`](src/pages/racconti/index.astro)) lists every story
with its cover. The list is a Vue island, `SearchBrowser.vue`
([`src/features/search`](src/features/search)), rendered to HTML at build time and hydrated with
`client:idle`, so the full list is in the page even without JavaScript (the controls are then
hidden).

- **Search**: MiniSearch over title, sub-genre, logline, setting, fears, tags and the opening of
  each story, with prefix matching, one typo forgiven in longer words and accents ignored. The index
  is built at build time by the [`/search-index.json`](src/pages/search-index.json.ts) endpoint
  and downloaded, together with MiniSearch itself, only when a reader goes to search.
- **Filters**: fear, place, theme, inspiration and form (short, in chapters, ongoing). Values of
  one filter add up, different filters narrow each other; values that would leave nothing are
  hidden. On phones they fold under a «Filtri» button.
- **Everything in the URL**: `/racconti?q=nebbia&luogo=mugello&ordine=titolo`, validated with a
  zod schema (`zod/mini`), so a filtered list can be shared and the back button undoes a filter.
  The story pages link straight to it.
- The count is announced to screen readers; the empty state reads «Nessun racconto qui, per ora.».

Each fear has its own indexable page, `/body-horror`, `/horror-psicologico`, `/slasher`,
`/liminale`, `/esperimenti` ([`src/pages/[categoria].astro`](src/pages/[categoria].astro)): its
stories, a link to the archive and the other four fears. Title and description come from
`fears.json` (`seo`), and so do the two optional fields of a subgenre: `intro`, one paragraph
(60–120 words) between the definition and the stories, and `watch`, the subgenre's video on
The Horror Scriptorium (a YouTube channel), linked without
`nofollow` (YouTube addresses only). The intros are drafts marked `[Segnaposto]`: rewrite the text
and delete the marker to make one final. These pages are static: no Vue reaches the browser.

### Books

`/libri` ([`src/pages/libri.astro`](src/pages/libri.astro)): the horror Elia has read and the books
on writing that taught him the craft. A shelf of covers on top (decorative), then the same search
island as `/racconti` with `kind="books"`: filters by section, author and decade, sort by author
(the default), title or year, and a prefix search on titles and authors (no MiniSearch index: two
dozen books do not need one). Each book links to its work on Open Library.

The books live in [`books.json`](src/core/content/books.json). Write by hand `title`, `authors`,
`section` (`horror` or `scrittura`), and optionally `originalTitle` (the title Open Library knows,
when yours is a translation) and `note`. Then run:

```sh
bun run libri:sync
```

It fills only what is missing, from [Open Library](https://openlibrary.org): the work id, the year
of first publication, and the cover, saved to `public/libri/<id>.jpg`. A field that already has a
value is never overwritten, so a correction made by hand stays. Open Library is edited by its
users: check the years in the diff before committing `books.json` with the new covers. A book Open
Library does not have keeps the typographic cover of the design system.

### Feedback form

«Ti è rimasto addosso qualcosa?» closes every story and the homepage
([`src/features/feedback`](src/features/feedback)). Only the message is required.

- With JavaScript, a small controller sends it to the `feedback` Astro Action and answers with one
  line. Without, the form posts to `/feedback`, the one page rendered on demand, which runs the same
  action and shows the result.
- The action saves the row in Turso (libSQL, through Drizzle), then e-mails it to Elia with Resend
  and marks it `delivered`. A failed e-mail never loses a message. A filled honeypot field is
  answered as a success and not saved.
- Environment: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `RESEND_API_KEY`, `FEEDBACK_TO` (see
  `.env.example`; typed in `src/core/config/env.ts`). Without the Resend ones, messages are saved
  but not e-mailed.
- The function runs in Dublin (`vercel.json`), next to the database (`aws-eu-west-1`).

### Consent and analytics

GA4 runs only after the reader accepts it in the consent banner
([`src/core/consent`](src/core/consent)): before that, no request reaches Google, and gtag.js is not
even loaded. On a yes, Consent Mode v2 starts with everything denied, then grants analytics only
(no ads). The choice is kept in `localStorage` (`colles-taciti:consenso`); «Preferenze cookie» in
the footer reopens the banner, and a later no deletes the `_ga` cookies. Without `PUBLIC_GA_ID`
there is no banner and no analytics.

Events, typed in [`src/core/analytics/track.ts`](src/core/analytics/track.ts): `story_start` (past
the first 2% of a story), `story_finish` (the fear note reached), `feedback_submit`,
`wattpad_click`, `resume_reading` (story page or homepage).

### SEO

Every page's `<head>` comes from [`src/core/seo/components/Seo.astro`](src/core/seo/components/Seo.astro): title, meta
description, canonical URL (never with a query string, so filtered archive views point to
`/racconti`), Open Graph with the story's 1200×630 cover, and JSON-LD: `WebSite` + `Person` on the
homepage, `ShortStory` (with `CreativeWorkSeries` and `Incomplete` where they apply) on stories,
`CollectionPage` on the fear pages. `@astrojs/sitemap` writes `sitemap-index.xml` (without
`/feedback` and the error pages), and `/robots.txt` points to it. Both follow
`site` in `astro.config.ts`, which is provisional until the domain exists.

### Security headers

- **Content Security Policy** (`security.csp` in `astro.config.ts`): Astro hashes every script and
  style it puts in a page, inline ones included, and writes the policy into a `<meta>` of each
  page. There is no `'unsafe-inline'`. Third parties are allowed only for GA4: its loader on
  googletagmanager.com and its hits on google-analytics.com, used only after consent. An e2e test
  (`tests/e2e/csp.spec.ts`) fails on any violation.
- **Headers in `vercel.json`**:
  - `frame-ancestors 'none'`, which a `<meta>` cannot carry;
  - `X-Content-Type-Options: nosniff`;
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - a `Permissions-Policy` that turns off the camera, the microphone and geolocation.
- Markdown syntax highlighting is off: Shiki's inline styles would break the CSP, and the stories
  have no code.

### Error pages

Both pages ([`src/features/errors`](src/features/errors)) show the design system's brand
illustration, the slab of flesh under the hills, drawn in code like the covers. They say
plainly what happened, then offer the ways back.

- **404** ([`src/pages/404.astro`](src/pages/404.astro)): static, no JavaScript. Built as
  `404.html`, which Vercel serves with status 404 for any missing address. It ends with «Scegli la
  tua paura».
- **500** ([`src/pages/500.astro`](src/pages/500.astro)): rendered on demand, for what runs on the
  server (`/feedback` and the feedback Action). It logs the error to the server logs and never
  shows it to the reader.

Both are `noindex`. Their texts are drafts in [`copy.ts`](src/features/errors/copy.ts).

### Story pages

Each story is one page, `/racconti/<slug>`, prerendered at build time
([`src/pages/racconti/[slug].astro`](src/pages/racconti/[slug].astro)):

- **Hero** with the story's cover band, then the **facts** (sub-genre, setting, reading time,
  date, content warnings), with fears linking to their pages and tags to the filtered archive
  (`/racconti?luogo=…`, `?tema=…`, `?ispirazione=…`).
- **Chapters**: every `## …` heading in the Markdown is a chapter with a stable anchor,
  `#capitolo-N`, whatever its title. Write `## La rampa` for a titled chapter (shown with a
  «Capitolo 1» label) or `## Capitolo 1` for an untitled one. A chapter index links to them, and
  `***` is a scene break («⁂»).
- **Reading controls**: «A−» and «A+» change the text size; the choice is remembered
  (`colles-taciti:testo`).
- **Reading progress**: while you read, story, chapter and percentage are saved in your browser
  only (`colles-taciti:lettura`, no cookie, nothing sent anywhere). Come back half-way and the page
  offers «Eri al capitolo N → Riprendi»; the homepage shows «Stai leggendo».
- Then the ongoing-story banner, **«La paura dietro il racconto»**, «Se ti è piaciuto» (two
  related stories) and the Wattpad link.

Story pages ship no framework: the cards are Vue components rendered to HTML on the server, and
the only scripts are three small controllers (theme, reading controls, reading progress). Without
JavaScript the whole story still reads; only the controls that need scripts are hidden.

### Covers

Every story gets a generated cover, no photo needed
([`src/features/covers`](src/features/covers)): a motif chosen by its main fear (a stitched slab
for body horror, a neon corridor for liminal stories, hills for slashers, circles for
psychological horror, notebook lines while a story is ongoing, a dot grid for experiments), its
title and the signature. The same SVG is drawn inline on the site, following the theme, and
rendered to PNG by `bun run copertine`:

| File | Size | Used for |
|---|---|---|
| `public/copertine/<slug>-anteprima.png` | 1200 × 630 | Link previews (Open Graph, WhatsApp) |
| `public/copertine/<slug>-wattpad.png` | 512 × 800 | Wattpad cover |
| `public/copertine/<slug>-instagram.png` | 1080 × 1350 | Instagram post |

Run it after adding a story or changing a title, label, status or main fear, and commit the PNGs
with `scripts/copertine.json`: a test fails while the covers are out of date. The script uses
[resvg](https://github.com/thx/resvg-js) with two static font instances in
[`scripts/fonts`](scripts/fonts) (SIL Open Font License). A story can override its cover in the
frontmatter:

```yaml
cover:
  lines: ["Se ni' mondo", "esistesse un", "po' di male"]  # title broken by hand, 1–3 lines
  motif: punti  # carne | corridoio | colline | cerchi | diario | punti
```

## <img src="https://api.iconify.design/lucide/rocket.svg?color=%23888888" width="22" align="top" alt="" /> Getting started

**Prerequisites**: [Bun](https://bun.sh) 1.4+, [Node.js](https://nodejs.org) 22.12+ (Astro's CLI
runs on Node), Git, and optionally the [GitHub CLI](https://cli.github.com).

```bash
git clone https://github.com/EliaGiolli/colles-taciti.git
cd colles-taciti
bun install                       # also installs the git hooks (lefthook)
bunx playwright install chromium  # browser for the end-to-end tests
cp .env.example .env              # no value is required yet
bun run dev                       # http://localhost:4321
```

Recommended VS Code extensions are listed in `.vscode/extensions.json`; the workspace settings
format on save with the right tool for each file type.

**Environment variables**

| Name | Used for |
|---|---|
| `SITE_URL` | Canonical URLs and sitemap |
| `TURSO_DATABASE_URL` | Feedback database |
| `TURSO_AUTH_TOKEN` | Feedback database auth |
| `RESEND_API_KEY` | Feedback email delivery |
| `FEEDBACK_TO` | Address that receives feedback |
| `PUBLIC_GA_ID` | GA4 measurement ID (loaded only after consent) |

## <img src="https://api.iconify.design/lucide/terminal.svg?color=%23888888" width="22" align="top" alt="" /> Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Start the dev server |
| `bun run build` | Build the static site |
| `bun run preview` | Preview a build made with `E2E=1` (Node adapter: the Vercel adapter has no preview) |
| `bun run typecheck` | `astro check` (`.ts`, `.astro`) + `vue-tsc` (`.vue`) |
| `bun run lint` | Biome + Prettier check (`.astro`/`.vue`) + dependency-cruiser |
| `bun run format` | Apply Biome and Prettier fixes |
| `bun run test` | Unit tests (`test:watch` for watch mode) |
| `bun run test:integration` | Integration tests |
| `bun run test:coverage` | Unit + integration tests with v8 coverage |
| `bun run test:e2e` | Build, then end-to-end tests (Playwright + axe) |
| `bun run check` | Everything except e2e |
| `bun run db:generate` | Generate a SQL migration in `drizzle/` from `src/features/feedback/server/table.ts` |
| `bun run db:migrate` | Apply pending migrations to `TURSO_DATABASE_URL` (reads `.env.local`) |
| `bun run copertine` | Render every story cover to PNG in `public/copertine` (see [Covers](#covers)) |
| `bun run libri:sync` | Complete `books.json` and download the covers from Open Library (see [Books](#books)) |

**Git hooks** (lefthook): every commit runs typecheck, lint and unit tests; every push runs
`check` and the end-to-end tests.

## <img src="https://api.iconify.design/lucide/flask-conical.svg?color=%23888888" width="22" align="top" alt="" /> Testing

- **Unit** tests sit next to the file they test (`*.test.ts`): Vitest with Astro's `getViteConfig`,
  the Container API for `.astro` components, Testing Library for `.vue`, jsdom for controllers.
- **Integration** tests live in `tests/integration` (e.g. the database on libSQL `:memory:` with the real migrations).
- **End-to-end** tests live in `tests/e2e`: Playwright + axe, at 375px and desktop, in both themes.
- Coverage is reported on every PR and does not block merging.
- **CI** (GitHub Actions, `.github/workflows/ci.yml`) runs typecheck, lint, unit + integration
  tests with coverage, the build, and the end-to-end suite on every pull request.

## <img src="https://api.iconify.design/lucide/git-pull-request.svg?color=%23888888" width="22" align="top" alt="" /> Git workflow

1. Branch from an up-to-date `main` (`feat/<name>`, `fix/<name>`, `chore/<name>`).
2. Implement with tests and comments.
3. `bun run check`, then commit with [Conventional Commits](https://www.conventionalcommits.org).
4. Push and open a PR with `gh pr create`.
5. The PR is merged by the maintainer only; then the branch is deleted.

No commits on `main`, no skipped hooks.

## <img src="https://api.iconify.design/lucide/list-checks.svg?color=%23888888" width="22" align="top" alt="" /> Project status

The project is built in 12 pull requests, from `chore/bootstrap` to `chore/launch`.
See [ROADMAP.md](ROADMAP.md) for the live checklist.

## <img src="https://api.iconify.design/lucide/link.svg?color=%23888888" width="22" align="top" alt="" /> UTM conventions

Links from social profiles carry UTM parameters, so GA4 can tell where readers come from.
*Proposed convention, to be confirmed in PR 9.*

| Source | `utm_source` | `utm_medium` | `utm_campaign` |
|---|---|---|---|
| Instagram bio | `instagram` | `social` | `bio` |
| Instagram post or story | `instagram` | `social` | `<story-slug>` |
| Wattpad story page | `wattpad` | `referral` | `<story-slug>` |
| Wattpad profile | `wattpad` | `referral` | `profile` |

Example: `https://<domain>/racconti/senza-rimorso?utm_source=wattpad&utm_medium=referral&utm_campaign=senza-rimorso`

## <img src="https://api.iconify.design/lucide/scale.svg?color=%23888888" width="22" align="top" alt="" /> License

The stories and texts are © Elia Giolli, all rights reserved.
The license for the source code has not been chosen yet.
