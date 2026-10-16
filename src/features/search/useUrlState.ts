/**
 * `useUrlState`: a Vue composable that keeps a reactive state in sync with
 * the address bar, through a URL schema (url-state.ts).
 *
 * - **Reading**: when the component mounts, and again whenever the reader
 *   moves through history (`popstate`: the back and forward buttons).
 * - **Writing**: `update()` changes the state and the URL together. Each
 *   call says how: `push` adds a history entry (a filter switched on, so
 *   «back» switches it off again), `replace` rewrites the current one
 *   (typing a search, where one entry per keystroke would make «back»
 *   unusable).
 *
 * **Why the URL is read in `onMounted` and not right away**: the island is
 * rendered twice, once on the server at build time and once in the
 * browser. The server knows no query string (the page is static), so it
 * renders the defaults. Vue «hydrates» the server HTML: it expects the
 * browser's first render to produce exactly the same markup, and warns
 * (and patches the page) when it does not. Starting from the defaults on
 * both sides, then applying the URL once mounted, keeps the two renders
 * identical; the filtered list follows a moment later.
 */
import { onBeforeUnmount, onMounted, type Ref, readonly, shallowRef } from "vue";
import { defaultParams, readParams, type UrlSchema, type UrlState, writeParams } from "./url-state";

/** How a change reaches the browser history. */
export type HistoryMode = "push" | "replace";

/** What {@link useUrlState} returns. */
export interface UrlStateHandle<S extends UrlSchema> {
  /** The current state. Read-only: change it with `update()`. */
  state: Readonly<Ref<UrlState<S>>>;
  /** Merges `patch` into the state and writes the URL. */
  update(patch: Partial<UrlState<S>>, mode?: HistoryMode): void;
}

/**
 * Binds the state described by `schema` to the query string of the current
 * page, for the lifetime of the calling component.
 *
 * @param onRead called after the state has been read from the URL (on
 *   mount and on back/forward), for state the component keeps outside,
 *   such as the text in the search box.
 */
export function useUrlState<S extends UrlSchema>(
  schema: S,
  onRead?: (state: UrlState<S>) => void,
): UrlStateHandle<S> {
  // A shallow ref: the state is replaced as a whole, never mutated in place.
  const state = shallowRef(defaultParams(schema)) as Ref<UrlState<S>>;

  function read() {
    state.value = readParams(schema, window.location.search);
    onRead?.(state.value);
  }

  onMounted(() => {
    read();
    window.addEventListener("popstate", read);
  });
  onBeforeUnmount(() => {
    window.removeEventListener("popstate", read);
  });

  function update(patch: Partial<UrlState<S>>, mode: HistoryMode = "push") {
    state.value = { ...state.value, ...patch };
    const { pathname, search, hash } = window.location;
    const params = writeParams(schema, state.value, new URLSearchParams(search));
    const query = params.toString();
    const url = `${pathname}${query === "" ? "" : `?${query}`}${hash}`;
    if (url === `${pathname}${search}${hash}`) return;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(window.history.state, "", url);
  }

  return { state: readonly(state) as Readonly<Ref<UrlState<S>>>, update };
}
