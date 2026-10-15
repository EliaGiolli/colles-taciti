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
- **Search and facets** (fear, place, theme, form) on stories and books, fully reflected in the URL.
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
| Content | Astro Content Collections (Markdown + zod, controlled tag vocabulary) |
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
  core/         app-wide infrastructure: layout, theme, consent, analytics, SEO, db, controllers
  features/     stories, search, categories, covers, books, feedback, home
  shared/       UI primitives, cva variants, utilities
content/        stories (Markdown), tags, fears, books
tests/          integration, e2e, fixtures
docs/           PLAN.md (decisions)
```

Dependency rules, enforced by dependency-cruiser:

- `shared` imports from nobody.
- `core` imports only from `shared`.
- `features/*` import from `core` and `shared`, and from another feature only through its `index.ts`.

The full design rationale lives in [docs/PLAN.md](docs/PLAN.md) (Italian).

### Design tokens

All colours, type styles, spacing and radii come from the Colles Taciti design system and live in
[`src/styles/app.css`](src/styles/app.css), exposed to Tailwind with `@theme inline`. Tailwind's
default scales are reset, so only design-system values exist (`bg-terra`, `text-lettura`,
`max-w-misura`, `p-5` = 24px), and there are no shadows or rounded utilities. Two themes, *Notte*
and *Nebbia*, switch with `data-theme` on `<html>`. The shared components are shown at
`/design-system` (noindex).

### Layout and theme

Every page renders inside [`BaseLayout`](src/core/layout/BaseLayout.astro): header (wordmark,
Racconti · Libri, theme switch), `<main>`, footer, and a skip link for keyboard users.

- **Notte is the default for everyone**; the operating system's `prefers-color-scheme` is
  deliberately ignored. The reader picks *Nebbia* with the switch in the header, and the choice is
  saved in `localStorage` (`colles-taciti:tema`).
- A tiny inline script in `<head>` applies the saved theme before the first paint, so there is no
  flash of the wrong theme. Its constants come from [`theme.ts`](src/core/theme/theme.ts) through
  `define:vars`. Without JavaScript the switch is hidden and the page stays in Notte.
- Navigating between pages uses native cross-document **View Transitions** (a 200ms cross-fade,
  CSS only), disabled entirely for readers who prefer reduced motion.

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
| `bun run preview` | Preview the production build |
| `bun run typecheck` | `astro check` (`.ts`, `.astro`) + `vue-tsc` (`.vue`) |
| `bun run lint` | Biome + Prettier check (`.astro`/`.vue`) + dependency-cruiser |
| `bun run format` | Apply Biome and Prettier fixes |
| `bun run test` | Unit tests (`test:watch` for watch mode) |
| `bun run test:integration` | Integration tests |
| `bun run test:coverage` | Unit + integration tests with v8 coverage |
| `bun run test:e2e` | Build, then end-to-end tests (Playwright + axe) |
| `bun run check` | Everything except e2e |

Coming with later features: `db:generate` / `db:migrate` (Drizzle migrations), `libri:sync`
(book data from Open Library), `copertine` (cover PNGs).

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

The project is built in 14 pull requests, from `chore/bootstrap` to `chore/launch`.
See [ROADMAP.md](ROADMAP.md) for the live checklist.

## <img src="https://api.iconify.design/lucide/link.svg?color=%23888888" width="22" align="top" alt="" /> UTM conventions

Links from social profiles carry UTM parameters, so GA4 can tell where readers come from.
*Proposed convention, to be confirmed in PR 11.*

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
