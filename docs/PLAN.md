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
| Chat e log nel testo | Blocchi recintati ```` ```chat ```` / ```` ```log ```` trasformati da un plugin mdast di **Sätteri** (il processore Markdown predefinito di Astro 7) registrato in `astro.config` (niente MDX) |
| Tag | **Vocabolario controllato** come collection (`tags`); i racconti ci si collegano con `reference()`, così uno slug sbagliato fa fallire la build |
| Ricerca e filtri | **Isola Vue** (`client:idle`) con **MiniSearch** (indice di metadati e incipit generato alla build, scaricato al primo uso) + faccette nell'URL (zod + composable `useUrlState`), su racconti e libri (la stessa isola, `kind="stories" | "books"`; i libri si cercano per prefisso, senza indice). Astro la renderizza lato server, quindi l'elenco completo è già nell'HTML |
| Schede condivise | `StoryCard.vue` e `BookItem.vue` sono **componenti Vue usati anche staticamente** dalle pagine Astro (senza direttiva `client:`, cioè 0 JS) e dall'isola: una sola fonte per il markup delle schede |
| Riprendi lettura | Controller TS: posizione in `localStorage` (racconto, capitolo, %), riga «Eri al capitolo N → Riprendi» |
| Modulo feedback | **Astro Action** (`accept: "form"`, zod) + **Turso (libSQL) con Drizzle** + **Resend**. Funziona anche senza JavaScript; un controller evita il ricaricamento. Protezione: **solo honeypot** |
| Analytics | **GA4 + Search Console**, banner dei cookie (Consent Mode v2, default negato), **eventi di lettura**, **UTM** su Instagram e Wattpad |
| Monitoraggio errori | **Niente Sentry per ora** |
| Font | **Fonts API di Astro** (stabile in Astro 7: chiave `fonts` in `astro.config`, `<Font preload>`, fallback ottimizzati automatici). Solo caratteri latini, preload di Literata regular |
| CSS e componenti | **Tailwind v4 + cva + clsx + tailwind-merge**, token del design system in `@theme`. **Niente shadcn**: componenti `.astro` e `.vue` scritti a mano, con varianti cva in file `.ts` condivisi |
| Immagini | `astro:assets` (`<Image>`/`<Picture>`, AVIF/WebP alla build) |
| Animazioni | **CSS**: View Transitions native fra documenti (`@view-transition { navigation: auto; }`, niente ClientRouter), `@starting-style` per il banner, animazioni legate allo scroll in `@supports`. Nell'isola: **`<TransitionGroup>` di Vue** (fade dei risultati). **Niente Motion** (non serve più) |
| Pagina /chi-sono | **Niente**. Le poche info su Elia stanno in homepage («Perché Colles Taciti»). Testata: Racconti · Libri |
| Libri | L'elenco di Elia (24 libri, 2026-10-17). Lo script `libri:sync` completa anno, opera e copertina da **Open Library**, senza mai sovrascrivere un campo scritto a mano. Nota personale **facoltativa** |
| Package manager | **Bun** |
| Qualità | `astro check` (`.ts` e `.astro`) **+ `vue-tsc --noEmit`** (`.vue`) + TypeScript strict + **Biome** per `.ts`/`.js`/`.css`/`.json` + **Prettier** (con prettier-plugin-astro) solo per formattare `.astro` e `.vue` + dependency-cruiser + controllo sul tono del brand + testi UI centralizzati |
| Test | **Test-as-you-go**: unit (Vitest con `getViteConfig` di Astro; **Container API** per i `.astro`; **@testing-library/vue** per i `.vue`; jsdom per i controller) accanto al file; integration in `/tests/integration`; e2e (Playwright + axe) in `/tests/e2e`. Copertura riportata, **non bloccante** |
| Date | `Intl` in `it-IT` con `timeZone: "Europe/Rome"` |
| Workflow | branch → feature/fix + test → check → commit → push → PR → **merge fatto da Elia** → pulizia dei branch |
| Lingue | Codice, identificatori, commenti (accurati, che spiegano il *perché*) e commit in inglese. Testi dell'interfaccia in italiano. Il JSDoc di ogni componente cita il suo nome nel design system |

## Architettura feature-based

**Regole di dipendenza** (dependency-cruiser in `bun run lint`): `shared` non importa da nessuno; `core` solo da `shared`; `features/*` da `core` e `shared`, e da un'altra feature solo tramite il suo `index.ts`. `src/pages` collega soltanto.

```
src/
  content.config.ts              collections: stories (glob su src/core/content/stories), tags, fears, books (file JSON)
  actions/index.ts               registra le Astro Actions (riesporta quella di features/feedback)
  pages/                         index.astro, racconti/index.astro, racconti/[slug].astro, [categoria].astro,
                                 libri.astro, search-index.json.ts (endpoint prerenderizzato), 404.astro
  core/
    config/env.ts                schema env (astro:env): SITE_URL, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, RESEND_API_KEY, FEEDBACK_TO, PUBLIC_GA_ID
    db/client.ts                 client libSQL + istanza Drizzle (solo lato server)
    controllers/registry.ts      mini-registro: per ogni [data-controller] chiama il controller giusto (un solo punto d'ingresso, nessuna libreria)
    layout/                      BaseLayout.astro (head, tema, banner), Header, Footer, Brand
    theme/                       script anti-flash (is:inline), ThemeToggle.astro + theme-toggle.controller.ts
    content/                     contenuti e regole sui testi: stories/*.md (un racconto per file),
                                 tags.json, fears.json (vocabolari), books.json (generato da libri:sync),
                                 brand-tone.ts + public-copy.ts (controllo sul tono del brand)
    consent/                     Consent Mode v2, loader di gtag, ConsentBanner.astro + consent.controller.ts
    analytics/track.ts           track(event, params): eventi tipizzati, inviati solo con il consenso
    seo/                         Seo.astro (title, meta, canonical, og, JSON-LD) + builder JSON-LD
  features/
    stories/                     query (getCollection), blocks/ (plugin chat e log), StoryCard.vue (statica o nell'isola), StoryFacts,
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
drizzle/  drizzle.config.ts      migrazioni versionate
scripts/                         copertine.ts, libri-sync.ts
tests/  integration/  e2e/  fixtures/
```

### Flusso dei dati
- **Racconti**: `.md` → Content Collections (zod + `reference`) → query in `features/stories` → `getStaticPaths` → HTML statico. L'endpoint prerenderizzato `search-index.json` produce l'indice di MiniSearch.
- **Feedback**: `<form method="POST" action={actions.feedback}>` → Action → zod → honeypot (se pieno: «ok» finto, nessun salvataggio) → insert in Turso → Resend → update `delivered`. Senza JS si ricarica la pagina con l'esito; con JS lo script invia con `fetch` e mostra «Ricevuto. Grazie per avermelo detto.».
- **Tabella `feedback`**: `id`, `story_slug` (null = homepage), `message`, `name`, `email`, `created_at`, `delivered`.
- **Analytics**: `track()` invia `story_start`, `story_finish` (NotaPaura visibile), `feedback_submit`, `wattpad_click`, `resume_reading` solo con il consenso. UTM documentate nel README. GA a 14 mesi di conservazione.
- **Libri**: `libri:sync` (manuale) → `src/core/content/books.json` + copertine → collection `books` → prerender.

### Schema di un racconto (frontmatter)
`title, lang: "it", categories[] (reference fears), tags{places[], themes[], inspirations[]} (reference tags), label, logline, setting, publishedAt, updatedAt?, warnings[], status: complete|ongoing, chapterReached?, series?, wattpadUrl?, seo{title, description}, starter?{order, hook}, related[] (reference stories), fearNote`. Lo slug è l'id del file.

## Ricerca, filtri e tag
- **/racconti**: l'HTML statico contiene già l'elenco completo, perché Astro renderizza l'isola Vue lato server (SEO e utenti senza JS). Dopo l'idratazione (`client:idle`) `SearchBrowser.vue` aggiunge ricerca (prefisso, ricerca approssimata, accenti ignorati), faccette paura/luogo/tema/ispirazione/forma e ordinamento per data, titolo o pertinenza (solo durante una ricerca), con tutto nell'URL. Risultati annunciati con `aria-live`; stato vuoto «Nessun racconto qui, per ora.».
- **/libri**: stessa isola (`kind="books"`), con faccette sezione/autore/decennio; ordinamento per autore (predefinito), titolo o anno; ricerca per prefisso sui dati della pagina, senza indice MiniSearch e quindi senza «Pertinenza».
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
5. **/libri**: titolo e frase, scaffale di copertine (decorativo), isola di ricerca (l'elenco completo è nell'HTML), credito a Open Library. Nota facoltativa.
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
- una sezione per PR della sequenza qui sotto (0–11), con i sotto-task in checkbox (`- [ ]` / `- [x]`), presi dalle sezioni di questo piano;
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
3. `feat/content-pipeline`: `content.config.ts`, collections, plugin chat e log, racconti segnaposto, query, controllo sul tono del brand.
4. `feat/story-page`: copertine (`cover.ts` + Cover + script PNG), componenti di lettura + pagina racconto, progressi di lettura.
5. `feat/home`.
6. `feat/search-filters`: endpoint dell'indice, isola SearchBrowser, /racconti, 5 categorie.
7. `feat/feedback`: Turso + Drizzle, Astro Action, honeypot, Resend, modulo.
8. `feat/seo`: Seo.astro, JSON-LD, sitemap, robots.
9. `feat/consent-analytics`: GA4 + Consent Mode + banner + `track()`.
10. `feat/books`: libri con ricerca e faccette (l'elenco di Elia), più introduzione e video di The Horror Scriptorium sulle pagine delle paure.
11. `chore/launch`: env su Vercel, Lighthouse, ritocchi.

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
- 2026-10-14 · PR 0 · Repository GitHub `EliaGiolli/colles-taciti`, privato. Su main c'è un unico commit vuoto (`chore: initial commit`) come base per le PR: è l'unica eccezione alla regola «mai commit su main». Vercel si collega alla fine della PR 0, Turso nella PR 7.
- 2026-10-14 · PR 0 · Aggiunto `README.md` in inglese (badge shields.io e icone skillicons.dev, niente emoji). Va aggiornato in ogni PR che cambia comandi, stack, variabili d'ambiente o funzionalità. Il controllo sul tono del brand non lo scansiona.
- 2026-10-14 · PR 0 · Verifiche di versione (§5), fatte su npm e sulla documentazione ufficiale:
  - **Astro 7.3.8** (Node ≥ 22.12).
  - **Fonts API stabile**: si usa quella; Fontsource + fontaine escono dal piano.
  - **Container API ancora sperimentale** (`experimental_AstroContainer` da `astro/container`; renderer Vue con `getContainerRenderer()`): si isola in un solo helper di test, così un cambio di nome tocca un file.
  - **`astro/tsconfigs/strictest`** include già `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` e `verbatimModuleSyntax`; si aggiunge solo `noPropertyAccessFromIndexSignature`.
  - **Biome 2.5**: il supporto a `.astro`/`.vue` è sperimentale (`html.experimentalFullSupportEnabled`, possibili falsi positivi). Decisione di Elia: Biome per `.ts`/`.js`/`.css`/`.json`, Prettier + prettier-plugin-astro solo per formattare `.astro`/`.vue`; su quei file Biome lavora con gli override consigliati dalla sua documentazione.
- 2026-10-14 · PR 0 · Strumenti (§4) approvati da Elia, in `.mcp.json` (scope di progetto): Astro Docs MCP, Context7, Playwright MCP (versione fissata). L'MCP del database si valuta nella PR 7, quando Turso esisterà. `.gitattributes` con `eol=lf`, per avere gli stessi a capo su Windows e in CI.
- 2026-10-14 · PR 0 · Scoperte dello scaffold:
  - **TypeScript resta alla 6.x** (6.0.3): la 7 (nativa) è uscita, ma `@astrojs/check` accetta solo `^5 || ^6`. Si aggiorna quando Astro la supporta.
  - **Versioni esatte** per tutte le dipendenze (`bunfig.toml` → `install.exact`), `packageManager: bun@1.4.0`.
  - **Typecheck in due passate**: `astro check` controlla `.ts` e `.astro`; `vue-tsc` usa `tsconfig.vue.json`, limitato a `src/**/*.{ts,vue}` senza test né pagine, perché non capisce i file `.astro`. Una dichiarazione «shim» per `*.astro` mandava `astro check` in esaurimento di memoria, quindi è stata scartata.
  - **Test dei `.astro`**: devono girare nell'ambiente Node di Vitest. Con jsdom, Vite compila il componente per il browser e Astro si rifiuta di renderizzarlo. L'helper `tests/helpers/render-astro.ts` renderizza lato server e usa JSDOM solo per leggere l'HTML.
  - **Registro dei controller**: i file `*.controller.ts` sono scoperti con `import.meta.glob` invece che con un elenco scritto a mano, così `core` non importa da `features` (regola rispettata) e un controller nuovo non va registrato.
  - **dependency-cruiser** non legge il frontmatter dei `.astro`: le regole valgono per `.ts` e `.vue`. Motivo in più per tenere sottili i `.astro`.
  - **Script incorporati**: Astro mette nell'HTML gli script sotto i 4 KB. Con una CSP rigida servono gli hash (supporto CSP di Astro) oppure `vite.build.assetsInlineLimit: 0`. Da decidere nella PR 11.
  - **URL senza slash finale** (`trailingSlash: "never"`), scelto subito per non cambiare i canonical dopo il lancio.
  - **Playwright** usa file `*.spec.ts`, Vitest `*.test.ts`: i due runner non si pestano i piedi. `astro preview` funziona anche con l'adapter Vercel.
- 2026-10-14 · PR 0 · Vercel collegato con la CLI (conferma di Elia): progetto `colles-taciti`, integrazione Git attiva, anteprima per ogni PR. `vercel link` aggiunge `.vercel` e `.env*` al `.gitignore`: vanno tolte, perché `.env*` scavalcherebbe `!.env.example`, e le regole esistenti coprono già `.vercel/` e `.env.local`. Il primo deployment di un progetto Vercel nuovo diventa sempre Production, anche se viene da un branch: è successo con `chore/bootstrap` (solo la pagina segnaposto). Il ramo di produzione è `main`; il preset del framework è stato impostato su Astro (la CLI lo aveva lasciato su «Other»).
- 2026-10-14 · PR 1 · Token e componenti di base:
  - **Scale di Tailwind azzerate** (colori, testo, spaziature, container, angoli, ombre, animazioni): esistono solo i valori del design system. `bg-orange-500`, `rounded-lg` o `shadow-md` non vengono generati, e `p-5` vale `space-5` (24px). Fuori scala si usa un valore arbitrario esplicito (`w-[96px]`).
  - **Pesi di Nebbia come token** (`--peso-titolo`, `--peso-corsivo`, `--peso-testo`, `--peso-mono`), letti da ogni stile `text-*`: nessuna classe specifica per tema. Le dimensioni sono in rem, così crescono se chi legge ingrandisce il carattere del browser.
  - **Font**: provider Google della Fonts API con asse `opsz`; i file sono scaricati alla build e serviti dal sito (nessuna richiesta a Google, verificata in e2e). Preload solo di Literata regular.
  - **tailwind-merge** esteso con le scale del design system: senza, `cn("text-osso", "text-lettura")` scartava una classe. Un test confronta `design-tokens.ts` con `app.css`.
  - **Regola «carne mai come testo»** controllata da un test. Unica eccezione, presa dal design system stesso: l'hover del pulsante su carne (fondo `su-carne`, testo `carne`).
  - **Componenti Vue con prefisso `Base`** (`BaseButton`, `BaseInput`), come chiede la guida di stile di Vue, per non confonderli con `<button>` e `<input>`.
  - **Spazi fra espressioni**: Astro elimina l'a capo fra due espressioni o fra `<slot />` e un elemento («Email(facoltativa)», «racconti→»). Si scrive lo spazio in modo esplicito; la freccia dei link usa uno spazio non separabile.
  - **Pagina `/design-system`** (noindex): tutti i componenti condivisi, con axe in Notte e Nebbia nei test e2e. Il tema si prova con `?tema=nebbia` (primo controller reale).
  - **Macchina di sviluppo con poca memoria impegnabile**: in locale Vitest usa al massimo 4 processi e Playwright 1 (con 2 i worker andavano ancora in crash, `0xC0000409`); in CI restano i valori predefiniti. Il test del colore di sfondo usa `toHaveCSS` (che riprova) invece di una lettura puntuale di `getComputedStyle`, che una volta aveva letto il colore di Notte subito dopo il cambio di tema.
  - **Punto aperto per la PR 2**: il design system dice che il tema segue `prefers-color-scheme` finché chi legge non sceglie; questo piano dice Notte come predefinito.
- 2026-10-15 · PR 2 · Layout e tema:
  - **Tema (decisione di Elia del 2026-10-14)**: Notte è il predefinito per tutti, sempre. Il sito **non segue** `prefers-color-scheme`, a differenza di quanto dice il README del design system: si legge di sera e il fondo scuro fa parte dell'atmosfera. Chi vuole Nebbia la sceglie con il selettore nella testata, e la scelta resta in `localStorage` (`colles-taciti:tema`).
  - **Script anti-flash** inline in `<head>` subito dopo `charset`; le costanti arrivano da `core/theme/theme.ts` con `define:vars`, così esiste una sola fonte. Senza JavaScript il selettore è nascosto via CSS (manca `data-theme`) e la pagina resta in Notte.
  - **Selettore del tema**: due pulsanti «Notte» e «Nebbia» con `aria-pressed` in un gruppo «Tema», invece di un pulsante che cambia etichetta. Il controller rispecchia sempre `data-theme` (MutationObserver) e applica la scelta fatta in un'altra scheda (evento `storage`).
  - **Testata**: Racconti · Libri (niente «Chi sono», come già deciso), poi il selettore del tema separato da un filetto. Su telefono va a capo: marchio sopra, navigazione e tema sotto.
  - **Piede**: tagline, Racconti · Libri · Portfolio · Instagram · Wattpad, firma con l'anno della build (fuso di Roma). «Preferenze cookie» arriva con il banner nella PR 9. Il motto segue l'anteprima del design system (Bodoni corsivo 20px), anche se è sotto la regola generale «Bodoni mai sotto i 24px». Gli indirizzi di Instagram, Wattpad e portfolio sono provvisori (punto aperto nella ROADMAP).
  - **Link di navigazione alti 48px** (`min-h-tocco`) invece dei 46px dell'anteprima: vale la regola del design system sulle righe toccabili.
  - **Favicon**: la «C» di Bodoni Moda (peso 600, `opsz` 6, più robusta a 16px) in osso su terra, convertita in tracciati SVG, così non dipende dai font installati. «CT» a 16px era illeggibile.
  - **View Transitions** native (`@view-transition { navigation: auto; }`) solo dentro `prefers-reduced-motion: no-preference`, dissolvenza di 200ms; la testata ha un proprio `view-transition-name` e resta ferma.
  - **Pagina `/design-system`**: il controller `styleguide-theme` e `?tema=nebbia` sono stati rimossi, ora c'è il selettore vero. Gli e2e impostano la scelta in `localStorage` prima del caricamento, così ogni tema è verificato dal primo disegno. Nuova sezione Marchio.
  - **Link per saltare al contenuto** («Vai al contenuto»), primo elemento con il focus di ogni pagina.
- 2026-10-15 · fix/footer-links · Link del piede confermati da Elia: portfolio `elia-giolli-portfolio-astro.vercel.app` e Wattpad `wattpad.com/user/EliaGiolli` (il profilo personale, dove i racconti sono già pubblicati, non @collestaciti). Il profilo Instagram non esiste ancora, quindi il link non c'è: si aggiunge quando il profilo sarà aperto, invece di mandare chi legge su una pagina vuota.
- 2026-10-15 · PR 3 · Pipeline dei contenuti:
  - **Sätteri al posto di remark**: da Astro 7 il processore Markdown predefinito è Sätteri (Rust); unified non è più installato e `markdown.remarkPlugins` è deprecato. Il plugin per ```` ```chat ```` e ```` ```log ```` è un plugin mdast di Sätteri (`features/stories/blocks/plugin.ts`). Il parsing sta in funzioni pure (`chat.ts`, `log.ts`), quindi cambiare processore toccherebbe un solo file. Il plugin produce il markup del design system (`ct-chat`, `ct-log`); gli stili arrivano con la pagina del racconto (PR 4). Un blocco scritto male ferma la build con il file e la riga sbagliata (Sätteri non fornisce il numero di riga ai plugin). Sintassi: `ora utente: messaggio`, `-- sistema`, `!! sistema grave`, opzioni `spettatori=` ed `etichetta=`; nei log `ERR`/`ERROR`/`FATAL` segnano l'errore, `~ ` il glitch statico, `~~ ` quello vivo (al massimo uno per blocco, come dice il design system).
  - **`readingTime` esce dal frontmatter**: il tempo di lettura si calcola dal testo (200 parole al minuto), così non invecchia quando il racconto cambia.
  - **Contenuti in `src/core/content/`** (scelta di Elia): i file dei racconti e dei vocabolari stanno nella stessa cartella del controllo sul tono del brand, così tutto ciò che riguarda i contenuti è in un posto solo. I `.md` e `.json` sono scrittura, i `.ts` codice. Le pagine non sono ancora collegate (PR 4).
  - **Controllo sul tono del brand** in `core/content` (vale per più feature): `findBrandToneIssues()` e lo schema `publicCopy()`, usato dagli schemi per titolo, etichetta, logline, campi SEO, `starter.hook`, nomi dei tag e delle paure. Una violazione fa fallire `astro check` e la build con il campo indicato. I nomi vietati sono una lista nel codice (`BANNED_NAMES`); quelli ambigui («Mele», «Vinci», «Lotti») sono scritti con il nome di battesimo, per non segnalare parole comuni.
  - **Altre regole negli schemi**: title SEO ≤ 60 caratteri e description ≤ 160 (brief SEO §5), nota sulla paura fra 80 e 150 parole (design system), avvertenze in minuscolo, `chapterReached` obbligatorio solo per i racconti in corso, `wattpadUrl` solo su wattpad.com, al massimo 2 racconti correlati.
  - **Controllo di integrità fra le voci** nelle query (`getStories()`): paure, tag e racconti correlati devono esistere, ogni tag deve stare nel gruppo giusto (luogo, tema, ispirazione), nessun racconto correlato a se stesso, nessuna posizione doppia in «Da dove cominciare». `reference()` controlla solo la forma dello slug, non l'esistenza.
  - **Test dei contenuti**: il content layer di Astro non gira dentro Vitest (`getCollection` restituisce collezioni vuote). I test d'integrazione leggono i file di `content/` e li validano con gli stessi schemi, più il controllo di integrità; le query si testano con `astro:content` simulato.
  - **Racconti segnaposto**: titoli, etichette, logline, ambientazioni e testi SEO vengono dal brief SEO v2; date, avvertenze, tag, testi e note sulla paura sono segnaposto marcati `[Segnaposto]`.
  - **Libri**: collection `books` con uno schema provvisorio e il file vuoto, finché la PR 10 non lo genera con `libri:sync`.
  - **Link del piede** (prima nella PR #4, chiusa e riunita a questa su richiesta di Elia): vedi la voce `fix/footer-links` qui sopra.
  - **Bun e Sätteri**: eseguire Sätteri direttamente con Bun si blocca (binding nativo); Astro e Vitest girano su Node, quindi il progetto non ne risente.
- 2026-10-15 · PR 4 · **Sequenza delle PR ridotta da 14 a 12** (richiesta di Elia): `feat/covers`, `feat/story-page` e `feat/reading-progress` diventano una sola PR, `feat/story-page` (PR 4), perché da sole erano troppo piccole. Le successive scalano di due: home 5, ricerca e filtri 6, feedback 7, SEO 8, consenso e analytics 9, libri 10, lancio 11. I rimandi «PR N» nel codice e in questo file seguono la nuova numerazione; i numeri delle pull request GitHub (#1, #2…) non cambiano.
- 2026-10-15 · PR 4 · Copertine, pagina del racconto e progressi di lettura:
  - **Copertine** (`features/covers`): `coverSvg()` è una funzione pura che disegna i quattro formati (anteprima 1200×630, Wattpad 512×800, Instagram 1080×1350 e una **banda 1600×640** per l'Hero del racconto, formato 5:2 del design system). Il motivo viene dalla paura principale (body horror → carne, liminale → corridoio, slasher → colline, psicologico → cerchi, esperimenti → punti); un racconto in corso ha sempre il diario. In alto a destra va l'etichetta del racconto, o «Slasher · in corso» per i racconti in corso, come nel design system; se non c'è spazio, «Colles Taciti» lascia il posto al genere. Ogni forma ha la classe del design system e gli attributi con i colori di Notte: nella pagina vincono le classi (la copertina segue il tema), nel PNG restano gli attributi (le copertine pubbliche sono sempre in Notte).
  - **Campo `cover` facoltativo** nel frontmatter: `lines` (titolo spezzato a mano, 1–3 righe, che unite devono dare esattamente il titolo) e `motif`. Senza, il titolo si spezza da solo con la regola del design system (al massimo 12 caratteri per riga, righe equilibrate, 44px oltre i 13 caratteri).
  - **Script `copertine` con resvg**: resvg legge solo TTF/OTF (niente WOFF2) e disegna i font variabili nella loro istanza predefinita, cioè Bodoni Moda a peso 400. Per avere il 500 del design system in `scripts/fonts` ci sono due istanze statiche (Bodoni Moda 48pt Medium, IBM Plex Mono Medium, licenza SIL OFL), scaricate da Google Fonts. `renderPng` sta nello script e non in `features/covers`, come diceva il piano: resvg è una dipendenza di sviluppo e il codice in `src` non può usarle. I PNG vanno in `public/copertine/` (versionati) e `scripts/copertine.json` tiene l'hash dell'SVG di ognuno: un test d'integrazione fallisce se una copertina non corrisponde più al racconto, senza eseguire resvg.
  - **Capitoli**: un secondo plugin Sätteri (`chapters-plugin.ts`) dà a ogni `## …` l'ancora `#capitolo-N`, indipendente dal titolo (rinominare un capitolo non rompe i link), e l'etichetta «Capitolo N» in `<small>` sopra il titolo. Un capitolo senza titolo si scrive `## Capitolo N` e il numero deve corrispondere alla posizione. Le pagine leggono l'elenco dei capitoli con una funzione pura sul Markdown (`chaptersFromMarkdown`); un test verifica su ogni racconto che coincida con quello del plugin. Il controllo di integrità ora confronta anche `chapterReached` con i capitoli del testo.
  - **Pagina del racconto**: Hero (banda della copertina e cartiglio) · SchedaTecnica · ResumeLine · indice dei capitoli e controlli di lettura · Prosa · InCorso · NotaPaura · (modulo, PR 7) · «Se ti è piaciuto» · Wattpad. Rispetto al mockup: niente «Capitolo successivo» né «Capitolo 1 di 5» (il racconto è una pagina unica, come deciso), e niente selettore del tema accanto ad A−/A+ (è già nella testata). La NotaPaura è una `<section>` con nome e non un `<aside>`, perché sta dentro `<main>`. Lo stacco di scena si scrive `***` (un `<hr>`, l'elemento HTML giusto) e il «⁂» è contenuto CSS.
  - **Link della SchedaTecnica**: le paure portano alla loro pagina (`/slasher`, che arriva nella PR 6), i tag all'archivio filtrato con parametri in italiano (`/racconti?luogo=…`, `?tema=…`, `?ispirazione=…`), fissati ora in `FILTER_PARAMS` perché la PR 6 legga gli stessi nomi.
  - **`StoryCard.vue` anticipata dalla PR 6**: serve già per «Se ti è piaciuto». È renderizzata sul server senza direttiva `client:`, quindi la pagina del racconto non carica Vue (verificato in e2e). Riceve dati semplici (`StoryCardData`) perché l'isola li riceverà in JSON.
  - **Controlli di lettura**: cinque misure (da 0,9 a 1,35 volte lo stile `lettura`), applicate con la variabile CSS `--scala-lettura` su `<html>` e salvate in `colles-taciti:testo`. Agli estremi i pulsanti diventano `aria-disabled` e non `disabled`, così il focus da tastiera non si perde. Niente script anti-flash per la misura: chi l'ha cambiata vede il testo riallinearsi una volta al caricamento, invece di bloccare ogni pagina per una preferenza usata solo nei racconti.
  - **Progressi di lettura**: posizione misurata su una linea di lettura a un terzo dello schermo e salvata come frazione del testo (resiste a schermi diversi e alla misura del testo), solo oltre il 2%, al massimo una volta al secondo e alla chiusura della pagina. Il racconto è «finito» quando la NotaPaura arriva alla linea di lettura, non appena compare in fondo allo schermo (con un testo breve sarebbe successo al 60%): la PR 9 deciderà se `story_finish` segue la stessa regola. Quello che arriva da `localStorage` si controlla campo per campo con una funzione scritta a mano (zod nel browser peserebbe decine di kilobyte) e solo i link interni al sito sono accettati. Al massimo 20 racconti ricordati. `ContinueReading` è pronto e compare in homepage con la PR 5.
  - **`content-files.ts` spostato** da `tests/helpers` a `scripts/lib`: lo usa anche lo script delle copertine, e uno script non deve dipendere dal codice dei test.
- 2026-10-15 · PR 5 · Homepage:
  - **Ordine** del piano: Hero · «Stai leggendo» (solo se c'è un racconto lasciato a metà) · introduzione · «Da dove cominciare» · «Ultimi racconti» · InCorso · «Scegli la tua paura» · «Perché Colles Taciti» · (modulo, PR 7). Testi, title e meta description dal brief SEO v2 (§5 e §6).
  - **Hero senza foto, per ora**: `abat-jour-notte.jpg` non c'è ancora (punto aperto). Al suo posto c'è l'illustrazione del marchio dell'artifact (componente «Cover»: la lastra di carne cucita, mezza sepolta da due colline), disegnata in SVG con gli strumenti delle copertine: segue il tema e non ha bisogno di crediti. Quando arriva la foto, si cambia solo lo slot `media` della pagina. L'H1 resta `display` (48px) anche su desktop, come nell'anteprima dell'Hero e nel mockup: a `display-xl` (72px), in una colonna di 5/12, «Racconti horror» andrebbe a capo parola per parola.
  - **«Inizia a leggere»** porta al primo racconto di «Da dove cominciare», quello scelto da Elia per chi arriva, invece che a un altro elenco: la homepage serve a far leggere (brief SEO § 1).
  - **«Ultimi racconti»** mostra i tre racconti più recenti **esclusi quelli in corso**, che hanno già il banner InCorso subito sotto (come nel mockup). Schede con la copertina (variante `ct-scheda--copertina` di `StoryCard.vue`, prevista per la PR 6 e anticipata) e il luogo nella riga dei metadati. Le griglie passano a tre colonne solo da 1024px (DS › Spazio).
  - **InCorso**: il racconto in corso più recente (uno solo per pagina), con la sua logline seguita da «I nuovi capitoli escono qui per primi.» e «Leggi dall'inizio».
  - **«Scegli la tua paura»** (`categories/FearPicker.astro`) con i conteggi; una paura senza racconti dice «nessuno, per ora» invece di «0 racconti».
  - **«Chi sono →» tolto** da «Perché Colles Taciti»: non c'è una pagina «Chi sono» (decisione già presa), e quella sezione è già tutto ciò che il sito dice di Elia.
  - **Spazi espliciti nel nome dei link a più parti** (SceltaPaura): «Body horror 1 racconto», non «Body horror1 racconto».
- 2026-10-16 · PR 6 · Ricerca, filtri e pagine delle paure:
  - **L'isola renderizzata sul server è l'elenco statico** di /racconti: niente elenco separato. Senza JavaScript i controlli (ricerca, filtri, ordinamento) sono nascosti con la nuova variante Tailwind `no-js:` (in app.css: `<html>` senza `data-theme` vuol dire che nessuno script è partito, lo stesso test del selettore del tema) e resta la lista completa. Con JavaScript i controlli sono visibili fin dal primo disegno, quindi la pagina non salta all'idratazione.
  - **Indice**: l'endpoint `/search-index.json` serve l'indice già serializzato da MiniSearch (`JSON.stringify`), non i testi; il browser lo carica con `MiniSearch.loadJSON` e le stesse opzioni (`SEARCH_OPTIONS`, un solo modulo per i due lati). Indicizzati: titolo, etichetta, logline, ambientazione, nomi delle paure e dei tag e le prime 120 parole del testo (senza titoli dei capitoli né blocchi chat e log). MiniSearch stesso è in un file a parte, scaricato con l'indice al primo focus sulla ricerca (o all'arrivo con `?q=`). Finché non c'è, l'isola cerca per prefisso sui dati che ha già; se il download fallisce, resta quella ricerca.
  - **Regole di ricerca**: prefisso, una lettera sbagliata ogni cinque solo sulle parole di almeno 5 lettere («apennino» trova «Appennino»), accenti ignorati, tutte le parole devono corrispondere (AND), parole vuote italiane escluse (articoli, preposizioni anche apostrofate). Peso: titolo 3, paure e tag 2, etichetta e luogo 1,5, logline 1, incipit 0,5.
  - **Faccette**: paura, luogo, tema, **ispirazione** (non era nel piano, ma la SchedaTecnica ci linka già dalla PR 4: senza, `?ispirazione=…` sarebbe stato ignorato) e **forma** (racconto breve, a capitoli, in corso). Valori della stessa faccetta in OR, faccette diverse in AND, conteggi «disgiuntivi» (ogni faccetta contata rispetto alle altre). I valori che lascerebbero zero racconti si nascondono, tranne quelli già scelti: con i soli filtri non si arriva mai a una lista vuota. Su telefono i filtri stanno sotto un pulsante «Filtri (n)»; da 1024px in una colonna a sinistra.
  - **Ordinamento**: più recenti (predefinito), titolo, e **pertinenza**, offerta solo mentre si cerca e predefinita in quel caso.
  - **URL** (`useUrlState`): parametri in italiano (`q`, `paura`, `luogo`, `tema`, `ispirazione`, `forma`, `ordine`), ripetuti per più valori, sempre nell'ordine dello schema; i valori predefiniti non si scrivono; i parametri estranei (`utm_*`) restano. Filtri e ordinamento aggiungono una voce alla cronologia («indietro» toglie l'ultimo filtro), la ricerca la riscrive dopo 250ms di pausa. L'URL si legge in `onMounted`, non subito: server e browser partono dallo stesso stato e l'idratazione non trova differenze. Il primo filtraggio dopo l'arrivo da un link non è animato.
  - **zod nel browser con `zod/mini`**: lo schema dell'URL usa la versione a funzioni di zod, che si può alleggerire in build. Misurato: circa 6 kB compressi, contro i circa 33 di Vue che l'isola carica comunque. `zod` è ora una dipendenza diretta, alla stessa versione di quella di Astro (una sola copia).
  - **`features/stories/client.ts`**: le query dei racconti importano `astro:content`, che Astro rifiuta nel codice per il browser, quindi l'isola non può usare `index.ts`. Una seconda API pubblica, `client.ts` (StoryCard, tipi, link, testi), e una regola di dependency-cruiser che segue le importazioni da ogni `.vue` e da ogni `client.ts` fino ad `astro:content`. Per la stessa ragione `TAG_KINDS` e `STORY_STATUSES` passano da `schema.ts` a `vocabulary.ts`.
  - **FacetChip** (`BaseFacetChip.vue`, varianti in `shared/variants/chip.ts`): pulsante con `aria-pressed`, alto 48px, angoli vivi; acceso = fondo osso e testo terra, senza spendere carne o ferita. Il numero è disegnato da solo («Mugello 1») e il nome accessibile è «Mugello 1 racconto» (`aria-label` che comincia con il testo visibile, WCAG 2.5.3): un nome composto da più elementi veniva letto in modo diverso da Chrome e da jsdom.
  - **Animazioni**: `<TransitionGroup>` con dissolvenza e spostamento di 200ms solo quando chi legge cambia qualcosa; il DS vieta le dissolvenze all'ingresso della pagina, e qui non ce ne sono. `prefers-reduced-motion` spegne tutto.
  - **Pagine delle paure** (`/[categoria]`, `CategoryPage.astro`): etichetta «Paura», nome come H1, definizione in Bodoni corsivo, conteggio, schede con copertina, «Tutti i racconti →» e «Le altre paure» (SceltaPaura senza quella corrente). Statiche, senza Vue nel browser. Una paura vuota (Esperimenti) mostra «Nessun racconto qui, per ora.». Title e description in `fears.json` (`seo`, stesso schema dei racconti, ora in `core/content/seo.ts`).
  - **Testi SEO di /racconti e delle paure**: scritti sullo schema del brief SEO v2 (§5), da confrontare con il brief (punto aperto nella ROADMAP).
  - **`fallthroughAttributes`** di vue-tsc attivo: con `strictTemplates`, `<BaseButton aria-expanded @click>` non passava il controllo dei tipi. `BaseButton` e `BaseInput` ora legano `$attrs` per intero (la fusione delle classi con `cn()` resta corretta).
- 2026-10-16 · PR 7 · Modulo di feedback:
  - **Senza JS il modulo va su `/feedback`**, unica pagina renderizzata a richiesta: Astro risponde a un POST di un'Action solo da una pagina non prerenderizzata, e le pagine dei racconti e la homepage sono file statici. `/feedback` mostra l'esito e un link per tornare alla pagina di prima (il Referer, se è del sito); in caso di errore ripropone il modulo con il testo e gli errori.
  - **Con JS** il controller chiama l'Action con il client di `astro:actions` e sostituisce il modulo con «Ricevuto. Grazie per avermelo detto.», spostando lì il focus. Gli errori dei campi li controlla prima il browser (`required`, `type="email"`).
  - **Ordine**: salvataggio, poi email, poi `delivered = true`. Un'email fallita non fa fallire l'invio. Honeypot pieno: risposta di successo, niente salvataggio. Mittente `onboarding@resend.dev` finché non c'è un dominio verificato su Resend.
  - **Variabili d'ambiente** tipizzate con `astro:env` (`core/config/env.ts`), tutte facoltative per la build statica.
  - **Database in Irlanda** (`aws-eu-west-1`, scelto da Elia): la funzione Vercel gira a Dublino (`vercel.json`, `dub1`).
  - **e2e con l'adapter Node** (`E2E=1`): `astro preview` non supporta l'adapter Vercel con funzioni. Il database degli e2e è un file usa e getta (`e2e.db`), migrato prima di partire; i test rileggono la riga da lì.
  - **MCP per il database**: non serve per ora. I feedback arrivano per email e si leggono dalla dashboard di Turso; se servirà, un MCP con token di sola lettura.
- 2026-10-16 · PR 8 · SEO: `Seo.astro` in `core/seo` scrive title, description, canonical (senza parametri: le viste filtrate di /racconti puntano a /racconti), Open Graph e Twitter e il JSON-LD (`WebSite` + `Person` in homepage, `ShortStory` con `CreativeWorkSeries` e `Incomplete` sui racconti, `CollectionPage` con l'elenco sulle paure). Immagine di anteprima: la copertina 1200×630 del racconto; in homepage quella del primo di «Da dove cominciare»; sulle paure quella del racconto più recente. `robots.txt` generato dalla build (chiude solo /feedback); /design-system resta fuori con `noindex`, non con robots.txt, altrimenti il crawler non leggerebbe il `noindex`. Sitemap senza /design-system e /feedback.
- 2026-10-17 · PR 9 · Consenso e analytics: **gtag.js non viene caricato prima del sì** (lo snippet standard lo carica sempre e manda comunque ping senza cookie). Dopo il sì: `consent default` tutto negato, `consent update` solo `analytics_storage` concesso, poi `config`. Scelta in `localStorage` (`colles-taciti:consenso`), «Accetta» e «Rifiuta» con lo stesso peso, banner fisso in basso senza overlay; «Preferenze cookie» nel piede lo riapre e un no successivo cancella i cookie `_ga`. Senza `PUBLIC_GA_ID` niente banner. `story_finish` segue la stessa regola dei progressi (NotaPaura sulla linea di lettura), `story_start` scatta oltre il 2%. Negli e2e l'ID è finto (`G-E2ETEST000`) e le richieste a Google sono intercettate; gli altri test partono con il consenso già rifiutato, così il banner non copre i clic.
- 2026-10-17 · PR 10 · Libri e pagine delle paure (decisioni prese con Elia il 2026-10-17):
  - **L'elenco di Elia** al posto dei dati di prova: 24 libri, 20 horror e 4 sulla scrittura (la ROADMAP diceva 23 e 19: il conto giusto è 24 e 20). «The Outsiders» è *The Outsider* di King; «Chtulu (Lovecraft)» è diventato *Il richiamo di Cthulhu*, da confermare.
  - **Nota personale facoltativa**: /libri non ha obiettivi SEO o GEO, serve a dare spunti a chi legge. Quando una nota c'è, la precede «Perché te lo consiglio —» o «Cosa mi ha insegnato —» (DS › Libro). Niente JSON-LD sulla pagina.
  - **Open Library e non Google Books**: niente chiave, niente quote, copertine che si possono scaricare e servire. `bun run libri:sync` cerca per titolo e primo autore, oppure per id dell'opera quando c'è già, e riempie solo i campi vuoti (`openLibraryId`, `year`, `cover`): un valore scritto o corretto a mano non viene mai sovrascritto. Open Library archivia quasi tutte le edizioni italiane come opere separate e povere (anno sbagliato, niente copertina), quindi un campo `originalTitle` scritto a mano dice al sync con quale titolo cercare (*The Green Mile* per *Il miglio verde*).
  - **Dati controllati a mano dopo il sync**, perché Open Library è scritto dagli utenti: corretti gli anni di *Salem's Lot* (1975, non 1959), *22/11/63* (2011, non 1925), *Misery* (1987), *Il richiamo di Cthulhu* (1928), *The Hellbound Heart* (1986), *On Writing* (2000), *Danse Macabre* (1981). *Books of Blood, voll. 1–3* è legato al Volume One (1984). *The Art and Business of Online Writing* non è su Open Library: anno a mano (2020), copertina tipografica.
  - **Copertine servite dal sito**: misura media (circa 180px di larghezza) in `public/libri`, versionate. Il browser di chi legge non chiama mai Open Library (nessuna terza parte, nessuna dipendenza dai loro server); il credito sta in fondo alla pagina e ogni libro collegato porta alla sua pagina su Open Library, nella stessa scheda.
  - **Isola generica**: `SearchBrowser.vue` riceve `kind` («stories» o «books»), che sceglie testi, ordinamenti (`archive-kinds.ts`) e scheda. Le funzioni di `archive.ts` sono generiche sui nomi delle faccette. La posizione di ogni elemento in ogni ordinamento (`ranks`) si calcola alla build, con la collazione italiana: nel browser si ordina per numeri e i dati della lista non portano campi che servono solo all'ordinamento. Lo schema dell'URL aggiunge un parametro per faccetta a runtime, quindi il suo tipo statico conosce solo `q` e `ordine`: i valori delle faccette passano da due funzioni (`selectionOf`, `selectionPatch`), l'unico punto con un cast.
  - **Libri nell'isola**: faccette sezione, autore (per cognome) e decennio («1980–1989»), niente faccetta «tag»; ordinamento per autore (predefinito, come dice il DS), titolo o anno; ricerca per prefisso su titolo, titolo originale, autori, sezione e anno, senza un secondo indice MiniSearch (24 libri non ne hanno bisogno) e quindi senza «Pertinenza». Stato vuoto: «Nessun libro qui, per ora.».
  - **`BookItem.vue`** (DS Libro con copertina): copertina di 64px in bianco e nero, a colori al passaggio del puntatore o col focus (filtro CSS, 300ms); ripiego tipografico senza copertina. I titoli non sono intestazioni: 24 `h2` sarebbero solo rumore per chi naviga per titoli con un lettore di schermo. **Scaffale** dell'Hero (`BookShelf.astro`): le copertine a larghezze alterne del DS, decorative (`aria-hidden`), caricate subito perché sopra la piega.
  - **Pagine delle paure**: un paragrafo d'introduzione fra la definizione e i racconti (60–120 parole), più il link al video del sottogenere su **The Horror Scriptorium**, il canale di Viktoria: un tributo e un backlink vero, quindi senza `nofollow`, nella stessa scheda. Il titolo del video è marcato `lang="en"` e la riga prima dice che è in inglese. Le introduzioni sono bozze di Claude in prima persona, segnate «[Segnaposto]»: Elia le riscrive in `fears.json` e toglie il segnaposto (punto aperto). Esperimenti non ha né introduzione né video, perché non è un sottogenere; il liminale non ha ancora il video. Gli indirizzi sono salvati senza il parametro di tracciamento `si` che aggiunge la condivisione di YouTube.
  - **`countWords` spostato in `shared/lib`**: lo usano gli schemi dei racconti e delle paure, e uno schema non può importare quello di un'altra feature (`content.config.ts` caricherebbe le query, e con loro `astro:content`, dentro la propria configurazione).
  - **Film horror**: dopo il lancio (ROADMAP › After launch).
