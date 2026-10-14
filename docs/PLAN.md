# Colles Taciti: piano di progettazione del sito (v2, Astro)

## Context

Elia vuole un sito di racconti horror in italiano, **Colles Taciti**, che renda i racconti gratuiti, indicizzabili da Google e capaci di raccogliere feedback sinceri. Il sito affianca Wattpad e Instagram. La cartella `C:\Users\elia_\Desktop\colles taciti - blog` è vuota e non è ancora un repository git: si parte da zero.

Fonti (Google Drive): «Sito horror - brief» (marketing v2, design system, codice, SEO v2), «Brief marketing e comunicazione v4» (prevale sulla v2), «Colles Taciti – Design system», «Colles Taciti — mockup.pdf», «SEO Crash Course». Il CSS dei componenti (`project/components/bundle.css`, `project/tokens.json`, anteprime HTML) è nell'artifact Design System `claude.ai/artifact/Hkokid6Hu8qg8dRu8SMmtM`.

Sintesi: l'obiettivo è farsi leggere e ricevere feedback; la SEO lavora sulla coda lunga e il traffico passa dalle pagine dei racconti. La voce è in prima persona e sobria. Il design ha due temi: «Notte» (scuro, predefinito) e «Nebbia» (chiaro). Al lancio escono 3 racconti completi più Senza Rimorso a puntate. Il contenuto che esiste solo sul sito è «La paura dietro il racconto».

Elia vuole anche imparare dal codice: architettura manutenibile, test fin da subito, workflow a PR e **commenti accurati in inglese** su tutto.

**v2**: si passa da TanStack Start ad **Astro**. Elia lo conosce già (portfolio compreso) e lo ha già collaudato con SEO, GA4 e Search Console. Astro manda zero JavaScript di default su un sito fatto soprattutto di testo. shadcn esce dal progetto.

**v3**: niente React. I widget piccoli sono **TypeScript puro a controller**; la ricerca è un'**isola Vue**. Motion non serve più: nell'isola si usa `<TransitionGroup>` di Vue, altrove CSS.

## Decisioni prese

| Tema | Scelta |
|---|---|
| Framework | **Astro** (output statico) + **`@astrojs/vue`** per l'unica isola (ricerca e filtri) |
| Interattività | **TypeScript puro a controller**: ogni componente `.astro` interattivo ha accanto `*.controller.ts`, agganciato al markup con `data-controller` / `data-*`. Funzioni tipizzate e testabili, 0 KB di runtime, compatibili con una CSP rigida. Vale per tema, banner dei cookie, controlli di lettura, ripresa della lettura, invio del modulo |
| Hosting | **Vercel** con `@astrojs/vercel`; repository GitHub con un'anteprima per ogni PR |
| Rendering | Tutte le pagine prerenderizzate. Unica parte on-demand: l'**Astro Action** del modulo |
| Architettura | **Feature-based**: `core` / `features` / `shared`; `src/pages` contiene solo file sottili |
| Racconti a capitoli | **Pagina unica con indice** (`/racconti/[slug]`, capitoli H2 con ancore `#capitolo-N`) |
| Contenuti | **Content Collections di Astro** (`src/content.config.ts`, loader `glob`, zod, `reference()`). Al lancio i testi sono segnaposto |
| Chat e log nel testo | Blocchi recintati ```` ```chat ```` / ```` ```log ```` trasformati da un plugin remark registrato in `astro.config` (niente MDX) |
| Tag | **Vocabolario controllato** come collection (`tags`); i racconti ci si collegano con `reference()`, così uno slug sbagliato fa fallire la build |
| Ricerca e filtri | **Isola Vue** (`client:idle`) con **MiniSearch** (indice di metadati e incipit generato alla build, scaricato al primo uso) + faccette nell'URL (zod + composable `useUrlState`), su racconti e libri. Astro la renderizza lato server, quindi l'elenco completo è già nell'HTML |
| Schede condivise | `StoryCard.vue` e `BookItem.vue` sono **componenti Vue usati anche staticamente** dalle pagine Astro (senza direttiva `client:`, cioè 0 JS) e dall'isola: una sola fonte per il markup delle schede |
| Riprendi lettura | Controller TS: posizione in `localStorage` (racconto, capitolo, %), riga «Eri al capitolo N → Riprendi» |
| Modulo feedback | **Astro Action** (`accept: "form"`, zod) + **Turso (libSQL) con Drizzle** + **Resend**. Funziona anche senza JavaScript; un controller evita il ricaricamento. Protezione: **solo honeypot** |
| Analytics | **GA4 + Search Console**, banner dei cookie (Consent Mode v2, default negato), **eventi di lettura**, **UTM** su Instagram e Wattpad |
| Monitoraggio errori | **Niente Sentry per ora** |
| Font | **Fonts API di Astro** se stabile nella versione installata (self-hosting, preload, metriche di ripiego). Altrimenti Fontsource + fontaine. Solo caratteri latini, preload di Literata regular |
| CSS e componenti | **Tailwind v4 + cva + clsx + tailwind-merge**, token del design system in `@theme`. **Niente shadcn**: componenti `.astro` e `.vue` scritti a mano, con varianti cva in file `.ts` condivisi |
| Immagini | `astro:assets` (`<Image>`/`<Picture>`, AVIF/WebP alla build) |
| Animazioni | **CSS**: View Transitions native fra documenti (`@view-transition { navigation: auto; }`, niente ClientRouter), `@starting-style` per il banner, animazioni legate allo scroll in `@supports`. Nell'isola: **`<TransitionGroup>` di Vue** (fade dei risultati). **Niente Motion** (non serve più) |
| Pagina /chi-sono | **Niente**. Le poche info su Elia stanno in homepage («Perché Colles Taciti»). Testata: Racconti · Libri |
| Libri | Elia fornisce l'elenco a brief completato. Lo script `libri:sync` scarica i dati da Open Library (in alternativa Google Books) |
| Package manager | **Bun** |
| Qualità | `astro check` (`.ts` e `.astro`) **+ `vue-tsc --noEmit`** (`.vue`) + TypeScript strict + **Biome** (supporto `.astro` da verificare allo scaffold; se serve, prettier-plugin-astro solo per formattare) + dependency-cruiser + controllo sul tono del brand + testi UI centralizzati |
| Test | **Test-as-you-go**: unit (Vitest con `getViteConfig` di Astro; **Container API** per i `.astro`; **@testing-library/vue** per i `.vue`; jsdom per i controller) accanto al file; integration in `/tests/integration`; e2e (Playwright + axe) in `/tests/e2e`. Copertura riportata, **non bloccante** |
| Date | `Intl` in `it-IT` con `timeZone: "Europe/Rome"` |
| Workflow | branch → feature/fix + test → check → commit → push → PR → **merge fatto da Elia** → pulizia dei branch |
| Lingue | Codice, identificatori, commenti (accurati, che spiegano il *perché*) e commit in inglese. Testi dell'interfaccia in italiano. Il JSDoc di ogni componente cita il suo nome nel design system |

## Architettura feature-based

**Regole di dipendenza** (dependency-cruiser in `bun run lint`): `shared` non importa da nessuno; `core` solo da `shared`; `features/*` da `core` e `shared`, e da un'altra feature solo tramite il suo `index.ts`. `src/pages` collega soltanto.

```
src/
  content.config.ts              collections: stories (glob su content/stories), tags, fears, books (file JSON)
  actions/index.ts               registra le Astro Actions (riesporta quella di features/feedback)
  pages/                         index.astro, racconti/index.astro, racconti/[slug].astro, [categoria].astro,
                                 libri.astro, search-index.json.ts (endpoint prerenderizzato), 404.astro
  core/
    config/env.ts                schema env (astro:env): SITE_URL, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, RESEND_API_KEY, FEEDBACK_TO, PUBLIC_GA_ID
    db/client.ts                 client libSQL + istanza Drizzle (solo lato server)
    controllers/registry.ts      mini-registro: per ogni [data-controller] chiama il controller giusto (un solo punto d'ingresso, nessuna libreria)
    layout/                      BaseLayout.astro (head, tema, banner), Header, Footer, Brand
    theme/                       script anti-flash (is:inline), ThemeToggle.astro + theme-toggle.controller.ts
    consent/                     Consent Mode v2, loader di gtag, ConsentBanner.astro + consent.controller.ts
    analytics/track.ts           track(event, params): eventi tipizzati, inviati solo con il consenso
    seo/                         Seo.astro (title, meta, canonical, og, JSON-LD) + builder JSON-LD
  features/
    stories/                     query (getCollection), remark-ct, StoryCard.vue (statica o nell'isola), StoryFacts,
                                 Prose, ChapterIndex, FearNote, LiveChat, LogLines, OngoingBanner,
                                 ReadingControls + reading-controls.controller.ts,
                                 reading-progress/ (reading-progress.controller.ts, storage, ResumeLine, ContinueReading)
    search/                      buildIndex (usato dall'endpoint), isola Vue SearchBrowser.vue (MiniSearch, faccette,
                                 TransitionGroup), useUrlState.ts (composable: zod ↔ URLSearchParams), ResultsCount (aria-live)
    categories/                  FearPicker.astro, CategoryPage.astro
    covers/                      cover.ts (SVG puro), Cover.astro, renderPng (usato dallo script)
    books/                       BookItem.vue (statica o nell'isola), Shelf.astro, client Open Library / Google Books, sync
    feedback/                    action (defineAction), FeedbackForm.astro + feedback-form.controller.ts, schema zod, tabella Drizzle, honeypot, client Resend
    home/                        HeroHome, Starters, WhyCollesTaciti
    (ogni feature ha copy.ts con i propri testi UI)
  shared/
    components/                  Button.astro (cva: primary, secondary, link, onFlesh), Field, Label, MetaRow, Section, Container
    vue/                         equivalenti Vue minimi per l'isola (Button, Input, FacetChip), con le stesse varianti cva
    variants/                    varianti cva in .ts, condivise da .astro e .vue
    lib/                         cn(), formatDate (Europe/Rome), plurali, normalizzazione del testo
  styles/app.css
content/
  stories/*.md                   un racconto per file
  tags.json, fears.json          vocabolari (le collection li validano)
  books.json                     generato da libri:sync
drizzle/  drizzle.config.ts      migrazioni versionate
scripts/                         copertine.ts, libri-sync.ts
tests/  integration/  e2e/  fixtures/
```

### Flusso dei dati
- **Racconti**: `.md` → Content Collections (zod + `reference`) → query in `features/stories` → `getStaticPaths` → HTML statico. L'endpoint prerenderizzato `search-index.json` produce l'indice di MiniSearch.
- **Feedback**: `<form method="POST" action={actions.feedback}>` → Action → zod → honeypot (se pieno: «ok» finto, nessun salvataggio) → insert in Turso → Resend → update `delivered`. Senza JS si ricarica la pagina con l'esito; con JS lo script invia con `fetch` e mostra «Ricevuto. Grazie per avermelo detto.».
- **Tabella `feedback`**: `id`, `story_slug` (null = homepage), `message`, `name`, `email`, `created_at`, `delivered`.
- **Analytics**: `track()` invia `story_start`, `story_finish` (NotaPaura visibile), `feedback_submit`, `wattpad_click`, `resume_reading` solo con il consenso. UTM documentate nel README. GA a 14 mesi di conservazione.
- **Libri**: `libri:sync` (manuale) → `content/books.json` + copertine → collection `books` → prerender.

### Schema di un racconto (frontmatter)
`title, lang: "it", categories[] (reference fears), tags{places[], themes[], inspirations[]} (reference tags), label, logline, setting, readingTime, publishedAt, updatedAt?, warnings[], status: complete|ongoing, chapterReached?, series?, wattpadUrl?, seo{title, description}, starter?{order, hook}, related[] (reference stories), fearNote`. Lo slug è l'id del file.

## Ricerca, filtri e tag
- **/racconti**: l'HTML statico contiene già l'elenco completo, perché Astro renderizza l'isola Vue lato server (SEO e utenti senza JS). Dopo l'idratazione (`client:idle`) `SearchBrowser.vue` aggiunge ricerca (prefisso, ricerca approssimata, accenti ignorati), faccette paura/luogo/tema/forma e ordinamento per data o titolo, con tutto nell'URL. Risultati annunciati con `aria-live`; stato vuoto «Nessun racconto qui, per ora.».
- **/libri**: stessa isola, configurata con faccette sezione/autore/decennio/tag; ordinamento predefinito per autore.
- **SEO**: indicizzabili solo le 5 categorie; canonical di /racconti senza parametri. Pagine per luogo quando un luogo avrà ≥2 racconti.

## Tailwind v4 sul design system
- `app.css`: `@import "tailwindcss"` (plugin Vite `@tailwindcss/vite`); `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`. I token di Notte e di Nebbia sono variabili su `[data-theme=…]`, esposte con `@theme inline` (`bg-terra`, `text-osso`, `bg-carne`, `text-ferita`, `font-display`, `text-lettura`, `max-w-misura`…). Nessun arrotondamento, nessuna ombra.
- I pesi di Nebbia stanno in `@layer base`; le classi della prosa, della chat e dei log in `@layer components`.
- Le varianti (pulsante, campo, etichetta, scheda) sono definite con cva in `shared/variants/*.ts`, condivise fra `.astro` e `.vue`, così le due versioni non divergono.

## Controller (TypeScript puro)
- Lo schema è quello di Alpine o Stimulus (HTML prima, comportamento agganciato), ma tipizzato: `<div data-controller="theme-toggle">` + `theme-toggle.controller.ts`, che esporta `connect(element: HTMLElement): () => void` (la funzione restituita ripulisce i listener).
- `core/controllers/registry.ts` è caricato una volta da BaseLayout: cerca i `[data-controller]` e importa i moduli in modo pigro (`import()`), quindi ogni pagina scarica solo i controller che usa.
- La logica pura (calcolo della percentuale letta, serializzazione delle preferenze, lettura del consenso) sta in funzioni separate, testate senza DOM; `connect` si testa con jsdom su HTML prodotto dalla Container API.

## Animazioni
- View Transitions native fra documenti (CSS), banner con `@starting-style` + `allow-discrete`, sezioni sotto la piega con `animation-timeline: view()` in `@supports`, transizioni CSS di opacità per modulo e tab.
- Nell'isola Vue: `<TransitionGroup>` con classi CSS per l'entrata, l'uscita e lo spostamento dei risultati.
- Mai su hero, H1 e prosa; con `prefers-reduced-motion` tutto si spegne.

## Pagine
1. **Homepage**: Hero, «Stai leggendo…», introduzione, «Da dove cominciare», «Ultimi racconti», InCorso, SceltaPaura con i conteggi, «Perché Colles Taciti», Modulo.
2. **/racconti**: elenco statico + isola di ricerca.
3. **/racconti/[slug]**: Hero, SchedaTecnica (tag come link ai filtri), ResumeLine, indice dei capitoli, ControlliLettura, Prosa, NotaPaura, Modulo, «Se ti è piaciuto», link a Wattpad.
4. **/[categoria]** ×5 (`getStaticPaths` dalla collection `fears`).
5. **/libri**: scaffale, elenco statico + isola di ricerca, nota obbligatoria.
6. **Piede**: tagline · Racconti · Libri · Portfolio · Instagram · Wattpad · Preferenze cookie.

## SEO tecnica
- `Seo.astro`: title e meta dal brief SEO §5, canonical (`Astro.site`), og:image per ogni racconto (PNG da `cover.ts` con resvg: 1200×630, 512×800, 1080×1350).
- JSON-LD: `WebSite` + `Person` in homepage, `ShortStory` (+ `CreativeWorkSeries`), `CollectionPage` per le categorie.
- `@astrojs/sitemap`, `robots.txt`, Search Console. `site` provvisorio in `astro.config`.

## Qualità e test
- **tsconfig.json**: estende `astro/tsconfigs/strictest` + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`. Alias `@/core`, `@/features`, `@/shared`.
- **Script**: `typecheck` (`astro check && vue-tsc --noEmit`), `lint` (biome + depcruise), `test` (unit), `test:integration`, `test:e2e`, `check` (tutti tranne e2e), `db:generate`, `db:migrate`, `libri:sync`, `copertine`.
- **Test dei `.astro`**: Container API (`experimental_AstroContainer` o la versione stabile, se c'è) → HTML → asserzioni con Testing Library sul DOM.
- **Controllo sul tono del brand**: niente `!`, emoji, maiuscolo urlato; nessun nome della lista vietata nei campi `seo`, `title`, `logline`, `tags`.
- **Test del DB**: libSQL `:memory:` con le migrazioni reali; MSW solo per Resend e Open Library.
- **Gate**: lefthook pre-commit (`typecheck` + `lint` + unit), `check` + e2e prima del push, GitHub Actions su ogni PR (typecheck, lint, unit, integration, build, e2e). Copertura v8 riportata nella PR, non bloccante.

## Workflow git
1. `git switch main && git pull` → `git switch -c feat/<nome>`.
2. Implementazione + test + commenti in inglese.
3. `bun run check` → commit in Conventional Commits (l'hook ricontrolla).
4. `git push -u origin feat/<nome>` → `gh pr create` (cosa, perché, come verificare, screenshot).
5. **Mi fermo e aspetto il tuo merge.**
6. `git switch main && git pull`, `git branch -d feat/<nome>`, `git push origin --delete feat/<nome>` se serve.

**Prima di partire** (azione verso l'esterno, ti chiedo conferma): `git init`, `gh repo create` (proposta `colles-taciti`, privato), collegamento a Vercel, database Turso.

## Istruzioni per Claude Code (da fare prima di `chore/bootstrap`, e da includere nella PR 0)

Questo piano verrà eseguito da Claude Code in VS Code, anche in sessioni diverse. Per non perdere contesto, la prima cosa da fare è fissarlo nel repository.

### 1. Copia del piano
Copiare questo file in `docs/PLAN.md`: è la fonte delle decisioni. Ogni modifica a una decisione si fa lì, nella stessa PR che la introduce, con una riga nel registro delle modifiche in fondo al file.

### 2. `CLAUDE.md` (radice del repository)
Breve (≤150 righe), scritto in inglese, con le istruzioni che Claude deve seguire in ogni sessione:
- **Progetto**: cos'è Colles Taciti in tre righe; link a `docs/PLAN.md` e `ROADMAP.md`.
- **Stack**: Astro (statico) + adapter Vercel, isola Vue solo per la ricerca, controller TS, Tailwind v4 + cva, Content Collections, Astro Actions, Turso + Drizzle, Resend, GA4 con Consent Mode, Bun.
- **Comandi**: `bun run dev | build | preview | typecheck | lint | test | test:integration | test:e2e | check | db:generate | db:migrate | libri:sync | copertine`.
- **Architettura**: regole `core` / `features` / `shared`, pagine sottili, nomi dei file (`*.controller.ts`, `*.test.ts`, `copy.ts`), test unit accanto al file e integration/e2e in `/tests`.
- **Convenzioni**: codice, identificatori, commenti e commit in inglese; commenti accurati e didattici (intestazione per file, JSDoc sugli export, il *perché* delle scelte non ovvie); testi dell'interfaccia in italiano dentro `copy.ts`; il JSDoc di ogni componente cita il suo nome nel design system.
- **Regole del brand da rispettare nel codice e nei contenuti**: niente `!`, emoji, maiuscolo urlato o estetica Halloween; maiuscolo solo per lo stile etichetta; nessun nome reale della vicenda del Mostro di Firenze in title, meta, tag o social; nessun verso di canzone; carne mai come colore del testo; niente ombre né angoli arrotondati (tranne le eccezioni del design system).
- **Workflow git obbligatorio**: branch da main aggiornato → feature con i suoi test → `bun run check` → commit (Conventional Commits) → push → PR con `gh` → **fermarsi e aspettare il merge di Elia** → `git pull` di main e cancellazione del branch locale e remoto. Mai commit su main, mai merge da soli, mai `--no-verify`.
- **Azioni che richiedono conferma**: creare servizi esterni (GitHub, Vercel, Turso, Resend, GA4), pubblicare, toccare variabili d'ambiente di produzione.
- **Fonti**: ID dei documenti Drive (brief, design system, mockup, storie) e URL dell'artifact del design system con `bundle.css` e `tokens.json`.
- **Verifica visiva**: Playwright (MCP o test e2e) a 375px e su desktop, nei temi Notte e Nebbia.

### 3. `ROADMAP.md` (radice del repository)
Lista di controllo viva, da **aggiornare alla fine di ogni task** e da includere nel commit della PR che lo completa:
- una sezione per PR della sequenza qui sotto (0–13), con i sotto-task in checkbox (`- [ ]` / `- [x]`), presi dalle sezioni di questo piano;
- per ogni PR completata: link alla PR, data del merge e note («cosa è cambiato rispetto al piano»);
- una sezione **Punti aperti** (dominio, testi reali, foto, elenco dei libri, chiavi) da spuntare man mano;
- una sezione **Dopo il lancio** (pagine per luogo, /en/, newsletter, Sentry, Pagefind).

Regole per Claude:
- all'inizio di ogni sessione legge `ROADMAP.md` e riparte dal primo task non spuntato;
- spunta un task solo quando il codice è scritto, i test passano e `bun run check` è verde;
- se un task cambia rispetto al piano, aggiorna anche `docs/PLAN.md`.

### 4. Ricerca di skill e strumenti
Prima di scrivere codice, Claude cerca skill, plugin e server MCP utili. Li **propone a Elia e li installa solo dopo la sua conferma**:
- **skill e plugin** (SearchSkills / SearchPlugins / SuggestSkills) con le parole chiave: astro, vue, typescript, tailwind, drizzle, turso/libsql, vitest, playwright, accessibility/a11y, seo, vercel, git/pr workflow, code review;
- **documentazione aggiornata via MCP**: il server MCP ufficiale della documentazione di Astro e un server di documentazione per librerie (per esempio Context7), per non scrivere codice basato su API vecchie (Fonts API, Container API, Actions, Content Layer cambiano spesso);
- **Playwright MCP**, per la verifica visiva in VS Code;
- l'elenco di quello che è stato scelto e installato va annotato in `CLAUDE.md` (sezione «Tooling»).

### 5. Verifiche di versione allo scaffold
Prima di scrivere le parti che dipendono dalla versione, controllare sulla documentazione attuale: stabilità della **Fonts API** di Astro (altrimenti Fontsource + fontaine), stato della **Container API**, supporto di **Biome** ai file `.astro` e `.vue` (altrimenti prettier solo per formattare), configurazione `tsconfig` «strictest» di Astro. Annotare l'esito in `docs/PLAN.md`.

## Sequenza delle PR
0. `chore/bootstrap`: `docs/PLAN.md`, `CLAUDE.md`, `ROADMAP.md` (vedi la sezione sopra), `create astro` (template minimo, TS strictest), Bun, adapter Vercel, integrazione Vue, registro dei controller, Biome, depcruise, lefthook, Vitest (unit + integration), Playwright, CI, test smoke, README.
1. `feat/design-tokens`: `app.css` dai token dell'artifact, font, varianti cva condivise, Button/Field/Label.
2. `feat/layout-theme`: BaseLayout, Header, Footer, Brand, tema, View Transitions native.
3. `feat/content-pipeline`: `content.config.ts`, collections, remark-ct, racconti segnaposto, query, controllo sul tono del brand.
4. `feat/covers`: `cover.ts` + Cover + script PNG.
5. `feat/story-page`: componenti di lettura + pagina racconto.
6. `feat/reading-progress`.
7. `feat/home`.
8. `feat/search-filters`: endpoint dell'indice, isola SearchBrowser, /racconti, 5 categorie.
9. `feat/feedback`: Turso + Drizzle, Astro Action, honeypot, Resend, modulo.
10. `feat/seo`: Seo.astro, JSON-LD, sitemap, robots.
11. `feat/consent-analytics`: GA4 + Consent Mode + banner + `track()`.
12. `feat/books`: libri con ricerca e faccette (dati di prova).
13. `chore/launch`: env su Vercel, Lighthouse, ritocchi.

## Punti aperti
- Nome e visibilità del repository GitHub; collegamento a Vercel; account Turso.
- Dominio non registrato.
- Testi reali, note sulla paura, avvertenze, date e tag di ogni racconto.
- Foto `abat-jour-notte.jpg`.
- Elenco dei libri.
- Chiavi di Resend e GA4.

## Verifica (per ogni PR e alla fine)
- `bun run check` e `bun run test:e2e` verdi; CI verde sulla PR.
- Build: l'HTML in `dist/` contiene il testo, title, meta, canonical e un JSON-LD valido. Le pagine dei racconti non caricano Vue né altri framework: solo i controller previsti (tema, consenso, lettura, modulo). Vue compare solo su /racconti e /libri. Nessun `opacity:0` sopra la piega.
- Playwright (MCP o test e2e) su `bun run preview`: 375px e desktop, Notte e Nebbia, confronto con il mockup e con le anteprime dell'artifact; focus da tastiera; ricerca e faccette (URL, tasto indietro); ripresa della lettura; modulo con e senza JavaScript (riga salvata nel DB, email, honeypot); nessuna richiesta a GA prima del consenso.
- Lighthouse mobile (SEO, accessibilità, performance) sulla homepage e su un racconto.

## Registro delle modifiche

Ogni modifica a una decisione si annota qui, nella stessa PR che la introduce (data · PR · cosa cambia e perché).

- 2026-10-14 · PR 0 · Il piano è copiato da `RULES-INIT.md`, che resta solo in locale (`docs/RULES-INIT.md`, in `.gitignore`). Da qui in poi la fonte è questo file.
- 2026-10-14 · PR 0 · Repository GitHub `EliaGiolli/colles-taciti`, privato. Su main c'è un unico commit vuoto (`chore: initial commit`) come base per le PR: è l'unica eccezione alla regola «mai commit su main». Vercel si collega alla fine della PR 0, Turso nella PR 9.
- 2026-10-14 · PR 0 · Aggiunto `README.md` in inglese (badge shields.io e icone skillicons.dev, niente emoji). Va aggiornato in ogni PR che cambia comandi, stack, variabili d'ambiente o funzionalità. Il controllo sul tono del brand non lo scansiona.