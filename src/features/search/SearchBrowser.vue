<script setup lang="ts">
/**
 * The search island of /racconti and /libri: search box, filters, sort
 * order and the list (PLAN › Ricerca, filtri e tag). DS: no dedicated
 * component; built from Modulo › campo (search box, select), FacetChip
 * (filters), Etichetta (facet names), and the list's own card:
 * SchedaRacconto with cover (DS: «usala nell'archivio /racconti») or
 * Libro with cover.
 *
 * **One island, two archives.** `kind` says which: it picks the texts, the
 * sort orders (archive-kinds.ts) and the card. Everything else is data
 * computed at build time (archive-build.ts, book-archive.ts): the items,
 * the facets and their values, each item's position in each order. So the
 * logic below knows nothing about stories or books.
 *
 * **Rendered twice.** Astro renders it on the server at build time, so the
 * static HTML already holds the complete list, readable by search engines
 * and by readers without JavaScript. In the browser it is hydrated with
 * `client:idle` (once the page is idle) and the controls come alive.
 * Without JavaScript the controls would do nothing, so they are hidden
 * (`no-js:hidden`, a variant defined in app.css) and only the list shows.
 *
 * **State** lives in the URL (`useUrlState`): search text, facet values
 * and sort order, so a filtered archive can be shared and «back» undoes a
 * filter. Typing rewrites the current history entry (after a short pause);
 * switching a filter or the order adds one.
 *
 * **Search.** With an `indexUrl` (the stories) it runs on MiniSearch's
 * index, downloaded on first use (`useSearchIndex`); until it arrives, a
 * plain prefix match on the data already here stands in, so typing never
 * looks broken. Without one (the books) the prefix match is the search.
 *
 * **Results** are announced by ResultsCount (`role="status"`). The list
 * animates with `<TransitionGroup>`: items fade in and out and slide into
 * place in 200ms. Only when the reader changes something: the first
 * filtering after hydration (from a link such as `?luogo=mugello`) is
 * instant, and `prefers-reduced-motion` turns everything off (app.css).
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { BookItem } from "@/features/books/client";
import { StoryCard } from "@/features/stories/client";
import { cn } from "@/shared/lib/cn";
import { fieldControl, fieldLabel, fieldWrapper } from "@/shared/variants/field";
import { labelVariants } from "@/shared/variants/label";
import BaseButton from "@/shared/vue/BaseButton.vue";
import BaseFacetChip from "@/shared/vue/BaseFacetChip.vue";
import BaseInput from "@/shared/vue/BaseInput.vue";
import {
  type ArchiveItem,
  countSelected,
  effectiveOrder,
  emptySelection,
  type Facet,
  facetCounts,
  matchesFacets,
  matchesText,
  RELEVANCE,
  selectedIn,
  sortItems,
  toggleOption,
  visibleOptions,
} from "./archive";
import { ARCHIVE_KINDS, type ArchiveKind, orderDefaults, urlOrders } from "./archive-kinds";
import { archiveUrlSchema, selectionOf, selectionPatch } from "./archive-url";
import { searchCopy } from "./copy";
import ResultsCount from "./ResultsCount.vue";
import { searchTerms } from "./terms";
import { useSearchIndex } from "./useSearchIndex";
import { useUrlState } from "./useUrlState";

const props = defineProps<{
  /** Which archive this is: the texts, the orders and the card follow. */
  kind: ArchiveKind;
  /** Every item, in the default order (archive-build.ts, book-archive.ts). */
  items: ArchiveItem[];
  /** The facets and their values, in display order. */
  facets: Facet[];
  /** Where the full-text index is served (`SEARCH_INDEX_PATH`); none for prefix search only. */
  indexUrl?: string;
}>();

/**
 * Read once: an island's props never change after hydration (Astro
 * serialises them into the page), so these need no `computed()`.
 */
const copy = searchCopy.kinds[props.kind];
const orders: readonly string[] = ARCHIVE_KINDS[props.kind].orders;
const defaults = orderDefaults(props.kind);
const facetKeys = props.facets.map((facet) => facet.key);

/**
 * How long typing must pause before the search runs and the URL changes.
 * Long enough not to search (and announce a count) on every keystroke,
 * short enough to feel immediate.
 */
const QUERY_DELAY_MS = 250;

/** Ids of the controls, for `<label for>` and `aria-controls`. */
const ids = {
  search: `cerca-${copy.idSuffix}`,
  sort: `ordina-${copy.idSuffix}`,
  panel: `filtri-${copy.idSuffix}`,
  facet: (key: string) => `filtro-${key}`,
} as const;

const searchIndex = props.indexUrl === undefined ? null : useSearchIndex(props.indexUrl);

/** The text in the search box, as typed (the URL gets it after the pause). */
const query = ref("");

const { state, update } = useUrlState(
  archiveUrlSchema(props.facets, urlOrders(props.kind)),
  (read) => {
    query.value = read.q;
    // Arriving with a search already in the URL: fetch the index right away.
    if (read.q !== "") void searchIndex?.load();
  },
);

const selection = computed(() => selectionOf(state.value, props.facets));
const hasQuery = computed(() => searchTerms(state.value.q).length > 0);

/**
 * The items matching the search text (id → relevance), or `null` when
 * there is no text to search for. Uses the index when it is loaded, the
 * prefix match (no relevance, all 0) otherwise.
 */
const textScores = computed<ReadonlyMap<string, number> | null>(() => {
  if (!hasQuery.value) return null;
  const search = searchIndex?.search.value;
  if (search) return search(state.value.q);
  const matching = props.items.filter((item) => matchesText(item, state.value.q));
  return new Map(matching.map((item) => [item.id, 0]));
});

/** The items left by the search text, before the filters. */
const pool = computed(() => {
  const scores = textScores.value;
  return scores === null ? props.items : props.items.filter((item) => scores.has(item.id));
});

const order = computed(() => effectiveOrder(state.value.ordine, hasQuery.value, defaults));
const sortOptions = computed<readonly string[]>(() =>
  defaults.relevance && hasQuery.value ? [...orders, RELEVANCE] : orders,
);

const results = computed(() =>
  sortItems(
    pool.value.filter((item) => matchesFacets(item, selection.value)),
    order.value,
    defaults.order,
    textScores.value ?? undefined,
  ),
);

const counts = computed(() => facetCounts(pool.value, selection.value));
const shownFacets = computed(() =>
  props.facets
    .map((facet) => ({
      facet,
      options: visibleOptions(
        facet,
        counts.value[facet.key],
        selectedIn(selection.value, facet.key),
      ),
    }))
    .filter((group) => group.options.length > 0),
);
const activeFilters = computed(() => countSelected(selection.value));

/** How many items switching `optionId` on would leave (the chip's number). */
function countOf(key: string, optionId: string): number {
  return counts.value[key]?.get(optionId) ?? 0;
}

/** On phones the filters fold under a button; from 1024px they are always open. */
const panelOpen = ref(false);

// ── Changes made by the reader ──────────────────────────────────────────

let queryTimer: ReturnType<typeof setTimeout> | undefined;

function commitQuery() {
  clearTimeout(queryTimer);
  const text = query.value.trim();
  if (text !== state.value.q) update({ q: text }, "replace");
}

watch(query, (text) => {
  // Set from the URL (on arrival, or back/forward): nothing to write.
  if (text.trim() === state.value.q) return;
  clearTimeout(queryTimer);
  queryTimer = setTimeout(commitQuery, QUERY_DELAY_MS);
});

function toggle(key: string, optionId: string) {
  update(selectionPatch(toggleOption(selection.value, key, optionId)));
}

function clearFilters() {
  update(selectionPatch(emptySelection(facetKeys)));
}

function resetAll() {
  clearTimeout(queryTimer);
  query.value = "";
  update({ ...selectionPatch(emptySelection(facetKeys)), q: "" });
}

function onSort(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (sortOptions.value.includes(value)) update({ ordine: value });
}

function loadIndex() {
  void searchIndex?.load();
}

// ── Animation only after the first sync with the URL ────────────────────

/**
 * Off until the state read from the URL on mount has been rendered: a
 * reader arriving from `?luogo=mugello` should see the filtered list, not
 * watch the other items fade out. `useUrlState` reads the URL in its own
 * `onMounted`, registered before this one, so one `nextTick` later that
 * render is done.
 */
const animate = ref(false);
onMounted(async () => {
  await nextTick();
  animate.value = true;
});
onBeforeUnmount(() => {
  clearTimeout(queryTimer);
});
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[20rem_1fr] lg:items-start lg:gap-7">
    <div class="flex flex-col gap-5 no-js:hidden">
      <form role="search" :class="fieldWrapper" @submit.prevent="commitQuery">
        <label :for="ids.search" :class="fieldLabel()">{{ copy.search.label }}</label>
        <BaseInput
          :id="ids.search"
          v-model="query"
          type="search"
          name="q"
          autocomplete="off"
          enterkeyhint="search"
          :placeholder="copy.search.placeholder"
          @focus="loadIndex"
        />
      </form>

      <BaseButton
        class="self-start lg:hidden"
        :aria-expanded="panelOpen ? 'true' : 'false'"
        :aria-controls="ids.panel"
        @click="panelOpen = !panelOpen"
      >
        {{ searchCopy.facets.toggle(activeFilters) }}
      </BaseButton>

      <div
        :id="ids.panel"
        role="group"
        :aria-label="searchCopy.facets.label"
        :class="cn('flex-col gap-5', panelOpen ? 'flex' : 'hidden lg:flex')"
      >
        <div
          v-for="group in shownFacets"
          :key="group.facet.key"
          role="group"
          :aria-labelledby="ids.facet(group.facet.key)"
          class="flex flex-col gap-2"
        >
          <p :id="ids.facet(group.facet.key)" :class="labelVariants({ tone: 'muted' })">
            {{ group.facet.label }}
          </p>
          <ul class="flex flex-wrap gap-2">
            <li v-for="option in group.options" :key="option.id">
              <BaseFacetChip
                :label="option.label"
                :pressed="selectedIn(selection, group.facet.key).includes(option.id)"
                :count="countOf(group.facet.key, option.id)"
                :count-label="copy.chipCount(countOf(group.facet.key, option.id))"
                @click="toggle(group.facet.key, option.id)"
              />
            </li>
          </ul>
        </div>
        <div v-if="activeFilters > 0">
          <BaseButton variant="link" @click="clearFilters">{{
            searchCopy.facets.clear
          }}</BaseButton>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex min-h-tocco flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <ResultsCount :count="results.length" :label="copy.count(results.length)" />
        <div class="flex items-center gap-3 no-js:hidden">
          <label :for="ids.sort" :class="fieldLabel()">{{ searchCopy.sort.label }}</label>
          <select
            :id="ids.sort"
            :value="order"
            :class="cn(fieldControl(), 'w-auto cursor-pointer')"
            @change="onSort"
          >
            <option v-for="option in sortOptions" :key="option" :value="option">
              {{ searchCopy.sort.option(option) }}
            </option>
          </select>
        </div>
      </div>

      <TransitionGroup
        tag="ul"
        class="relative flex max-w-[40rem] flex-col"
        :css="animate"
        enter-active-class="transition-opacity"
        enter-from-class="opacity-0"
        leave-active-class="absolute inset-x-0 transition-opacity"
        leave-to-class="opacity-0"
        move-class="transition-transform"
      >
        <li v-for="item in results" :key="item.id">
          <StoryCard v-if="item.card.type === 'story'" :story="item.card.data" :heading-level="2" />
          <BookItem v-else :book="item.card.data" />
        </li>
      </TransitionGroup>

      <div v-if="results.length === 0" class="no-js:hidden">
        <BaseButton @click="resetAll">{{ searchCopy.results.reset }}</BaseButton>
      </div>
    </div>
  </div>
</template>
