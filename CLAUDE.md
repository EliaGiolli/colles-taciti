# CLAUDE.md

Instructions Claude must follow in every session on this repository.

## Project

Colles Taciti is an Italian horror-fiction site by Elia Giolli: free stories that Google can index,
built to collect honest reader feedback. It sits alongside Wattpad and Instagram.
- Decisions: [docs/PLAN.md](docs/PLAN.md) (Italian). Change a decision only there, in the PR that
  introduces it, with a line in its change log.
- Progress: [ROADMAP.md](ROADMAP.md). **At the start of every session, read it and resume from the
  first unchecked task.**

## Stack

Astro (static output) + `@astrojs/vercel` · one Vue island (`@astrojs/vue`) for search and filters only ·
plain TypeScript controllers for every other widget · Tailwind v4 + cva + clsx + tailwind-merge ·
Content Collections (glob loader, zod, `reference()`) · Astro Actions for the feedback form ·
Turso (libSQL) + Drizzle · Resend · GA4 + Consent Mode v2 · MiniSearch · Bun.
No React, no shadcn, no Motion, no Sentry (for now).

## Commands

| Command | Purpose |
|---|---|
| `bun run dev` / `build` / `preview` | Astro dev server, static build, preview of the build |
| `bunx astro dev --background` | Dev server in background (`astro dev stop`, `status`, `logs`) — use this from Claude |
| `bun run typecheck` | `astro check` (.ts, .astro) + `vue-tsc -p tsconfig.vue.json` (.vue) |
| `bun run lint` | Biome + Prettier check (`.astro`/`.vue` only) + dependency-cruiser |
| `bun run format` | Biome + Prettier, writing fixes |
| `bun run test` / `test:watch` | Unit tests (Vitest project `unit`), co-located with the code |
| `bun run test:integration` | Integration tests in `tests/integration` |
| `bun run test:coverage` | Unit + integration with v8 coverage (informative, no thresholds) |
| `bun run test:e2e` | Build, then Playwright + axe in `tests/e2e` against `astro preview` |
| `bun run check` | Everything except e2e. Must be green before every commit |
| `bun run copertine` | Render the story covers to PNG (`public/copertine`) and update `scripts/copertine.json`; run after adding a story or changing its title, label, status or main fear |

Added by later PRs: `db:generate` / `db:migrate` (PR 7), `libri:sync` (PR 10).

Hooks (lefthook): pre-commit runs typecheck + lint + unit; pre-push runs `check` + e2e.

## Architecture

- `src/shared` imports from nobody; `src/core` only from `shared`; `src/features/*` from `core` and
  `shared`, and from another feature only through its `index.ts`. Enforced by dependency-cruiser.
- `src/pages` files stay thin: they only wire features together.
- File names: `*.controller.ts` (exports `connect(el): () => void`), `*.test.ts` next to the file
  under test, `copy.ts` per feature for UI strings.
- Integration tests in `tests/integration`, e2e in `tests/e2e` (`*.spec.ts`, Playwright only),
  fixtures in `tests/fixtures`, helpers in `tests/helpers` (alias `@tests/*`).
- Render `.astro` components in tests only through `tests/helpers/render-astro.ts`, and keep those
  test files in the Node environment (never `@vitest-environment jsdom`: Astro refuses to render).
  Controller tests use jsdom.
- No test files inside `src/pages`: any `.ts` there becomes a route.
- Controllers are discovered by `import.meta.glob` in `src/core/controllers/start.ts`; names must be
  unique across `src/`.
- Story pages must not ship Vue: only the planned controllers. Vue appears only on /racconti and /libri.

## Conventions

- Code, identifiers, comments and commit messages in **English**. UI text in **Italian**, inside `copy.ts`.
- Elia wants to learn from the code, so comments are thorough and teach:
  - a header comment for every file (what it is, why it exists);
  - JSDoc on every export;
  - the *why* behind every non-obvious choice or trade-off.
- Every component's JSDoc names its design-system counterpart (e.g. `DS: Button / primary`).
- Dates: `Intl` with `it-IT` and `timeZone: "Europe/Rome"`.
- TypeScript strictest. No `any`, no `@ts-ignore` without a comment explaining why.
- Styling: only DS tokens from `src/styles/app.css` (Tailwind defaults are reset: `text-xl`,
  `p-10`, `rounded-lg`, `shadow-*` do not exist). Merge classes with `cn()` from
  `@/shared/lib/cn`; when adding a token to app.css, add its name to `shared/lib/design-tokens.ts`
  (a test enforces it). Variants live in `shared/variants/*.ts`, shared by `.astro` and `.vue`.
- Vue components shared with the island are named `Base*` (`BaseButton.vue`), never one word.
- Astro drops the line break between two `{expressions}` or between `<slot />` and an element:
  write the space explicitly (`{" "}`, or `&nbsp;` inside the element).
- Every new shared component also goes on `/design-system` (e2e runs axe there in both themes).
- Content lives in `src/core/content/` (stories, `tags.json`, `fears.json`, `books.json`), next to the brand-tone check. Any field readers
  or search engines see uses `publicCopy()` from `@/core/content/public-copy` in its schema (brand-tone
  check). Markdown runs through Sätteri (Astro 7 default), not remark: plugins are Sätteri mdast plugins.
- Dependencies use exact versions (`bunfig.toml`). TypeScript stays on 6.x until `@astrojs/check`
  supports 7.

## Brand rules (code and content)

- No `!`, no emoji, no shouting caps, no Halloween aesthetic. Uppercase only through the label style.
- No real names from the Monster of Florence case in title, meta, tags or social copy.
- No song lyrics.
- The `carne` colour is never used for text.
- No shadows, no rounded corners (except where the design system says otherwise).
- These rules apply to site content and UI. They do not apply to README/docs.

## Git workflow (mandatory)

1. `git switch main && git pull` → `git switch -c <type>/<name>` (e.g. `feat/design-tokens`).
2. Implement with its tests and comments.
3. `bun run check` → commit with Conventional Commits (the lefthook hook re-checks).
4. Update `ROADMAP.md` (tick tasks, notes) and `README.md` in the same PR. Tick a task only when the
   code is written, tests pass and `bun run check` is green.
5. `git push -u origin <branch>` → `gh pr create` (what, why, how to verify, screenshots).
6. **Stop and wait for Elia to merge.**
7. `git switch main && git pull`, `git branch -d <branch>`, `git push origin --delete <branch>` if needed.

Never commit on main. Never merge alone. Never use `--no-verify`.

## README

`README.md` is in English, with shields.io badges and skillicons.dev icons (no emoji).
Any PR that changes commands, stack, environment variables or features updates it in the same commit.

## Actions that need Elia's confirmation

- Creating or linking external services: GitHub, Vercel, Turso, Resend, GA4.
- Publishing or deploying anything.
- Touching production environment variables.
- Installing skills, plugins or MCP servers.

## Sources

Google Drive (folder `1C2mnDUzVtPcJJZsLY02krUmFsPhvXp_6`):
- «Sito horror - brief» `1665sPBkzgOnEMsyOyS9KaLpLffTZGxxb1uEBlAqu-pI`: marketing v2, design system,
  code, SEO v2 (SEO titles, meta, homepage copy).
- «Brief marketing e comunicazione v4» `1szkOTihql_2ziygeW2alhpWr2rprI6CltjTwY_tQ_ks` (supersedes v2).
- «Colles Taciti – Design system» `1GW1dahAFV7L7uPBhnTpaPjfezBaHUFUgr4jBBUXZiGc`.
- «Colles Taciti — mockup.pdf» `12cbI4ebS8pzb6GNFizWPKi5f8zO9IETG`.
- Story drafts: folder «storie» `1NA825G3PTMkSxYCX28iuKHMoMw4NEmEO`.

Design System artifact (`project/components/bundle.css`, `project/tokens.json`, component previews):
https://claude.ai/artifact/Hkokid6Hu8qg8dRu8SMmtM

## Visual verification

Use Playwright (MCP or e2e tests) on `bun run preview`: 375px and desktop, both themes
(Notte = dark, default; Nebbia = light). Compare with the mockup and the artifact previews.

## Tooling

MCP servers approved by Elia, registered in [.mcp.json](.mcp.json) (project scope, no secrets):
- **astro-docs** (`https://mcp.docs.astro.build/mcp`): official Astro docs. Check it before writing
  version-sensitive Astro code (Actions, Content Layer, Container API, Fonts API).
- **context7** (`https://mcp.context7.com/mcp`): current docs for libraries (Vue, Tailwind v4,
  Drizzle, Vitest, Biome, zod). Used without an API key for now.
- **playwright** (`@playwright/mcp`, pinned): visual checks. Wrapped in `cmd /c` because `npx` needs
  it on native Windows.
- Database MCP: deferred to PR 7 (no database exists before then).

Prefer these over memory when an API might have changed.
