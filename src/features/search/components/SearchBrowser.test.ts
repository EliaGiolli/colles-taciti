// @vitest-environment jsdom
/**
 * Tests for the search island, rendered in jsdom with Vue Testing Library
 * on the fixture archive. They go through the reader's path: the list, a
 * filter, the URL, «back», a search before and after the index arrives,
 * the empty state, the sort order and the phone layout. Then the same
 * island on the books, where only the data and the `kind` change.
 *
 * `fetch` is replaced per test: the index is served from the fixture
 * documents, or refused, to exercise the fallback. Vue Test Utils stubs
 * `<TransitionGroup>` by default, so lists update without waiting for
 * animations.
 */
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/vue";
import { documents, facets, items } from "@tests/fixtures/archive";
import { bookFacets, bookItems } from "@tests/fixtures/books";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { buildIndex } from "../helpers/search-index";
import SearchBrowser from "./SearchBrowser.vue";

const INDEX_URL = "/search-index.json";
const indexJson = JSON.stringify(buildIndex(documents));

function serveIndex() {
  const fetchMock = vi.fn(async () => new Response(indexJson, { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderBrowser() {
  return render(SearchBrowser, {
    props: { kind: "stories", items, facets, indexUrl: INDEX_URL },
  });
}

const titles = () =>
  screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent?.trim());
const status = () => screen.getByRole("status").textContent?.trim();
/** A facet chip by its label: its full name is «Mugello 1 racconto». */
const chip = (label: string) =>
  screen.getByRole("button", { name: (name) => name.startsWith(`${label} `) && name !== label });
const searchBox = () => screen.getByRole("searchbox", { name: "Cerca fra i racconti" });

/** Types into the search box and lets the pause before searching run out. */
async function type(text: string) {
  await fireEvent.update(searchBox(), text);
  vi.advanceTimersByTime(250);
  await nextTick();
}

beforeEach(() => {
  window.history.replaceState(null, "", "/racconti");
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SearchBrowser", () => {
  it("lists every story, newest first, with the count", () => {
    renderBrowser();

    expect(titles()).toEqual([
      "Senza Rimorso",
      "Il limbo dei processi",
      "Se ni' mondo esistesse un po' di male",
      "Le vibrazioni",
    ]);
    expect(status()).toBe("4 racconti");
  });

  it("filters with a chip, writes the URL, and «back» undoes it", async () => {
    renderBrowser();

    await fireEvent.click(chip("Mugello"));

    expect(chip("Mugello").getAttribute("aria-pressed")).toBe("true");
    expect(titles()).toEqual(["Se ni' mondo esistesse un po' di male"]);
    expect(status()).toBe("1 racconto");
    expect(window.location.search).toBe("?luogo=mugello");

    window.history.replaceState(null, "", "/racconti");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await nextTick();

    expect(status()).toBe("4 racconti");
    expect(chip("Mugello").getAttribute("aria-pressed")).toBe("false");
  });

  it("names each chip with its count, and hides values that lead nowhere", async () => {
    renderBrowser();
    // The count is drawn as a bare «2», and read out as «2 racconti».
    expect(screen.getByRole("button", { name: "Slasher 2 racconti" })).toBe(chip("Slasher"));
    expect(chip("Liminale")).toBeTruthy();

    await fireEvent.click(chip("Mugello"));

    // Same facet: Pisa stays, it would add its story (OR).
    expect(chip("Pisa")).toBeTruthy();
    // Other facets: only what Mugello's story has.
    expect(screen.queryByRole("button", { name: /^Liminale \d/ })).toBeNull();
    expect(chip("Slasher")).toBeTruthy();
  });

  it("applies the filters of the URL it arrives with", async () => {
    window.history.replaceState(null, "", "/racconti?paura=slasher&forma=in-corso");
    renderBrowser();
    await nextTick();

    expect(titles()).toEqual(["Senza Rimorso"]);
    expect(chip("Slasher").getAttribute("aria-pressed")).toBe("true");
  });

  it("searches with the fallback while the index is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 404 })),
    );
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    renderBrowser();

    await fireEvent.focus(searchBox());
    await type("vibraz");

    expect(titles()).toEqual(["Le vibrazioni"]);
    expect(window.location.search).toBe("?q=vibraz");
  });

  it("downloads the index on focus, once, and then searches the opening of the text", async () => {
    const fetchMock = serveIndex();
    renderBrowser();

    await fireEvent.focus(searchBox());
    await fireEvent.focus(searchBox());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(INDEX_URL);

    // «comodino» is only in the first lines of Le vibrazioni.
    await type("comodino");
    await waitFor(() => expect(titles()).toEqual(["Le vibrazioni"]));
  });

  it("orders by relevance while searching, and offers it only then", async () => {
    serveIndex();
    renderBrowser();
    const sort = screen.getByRole("combobox", { name: "Ordina per" });
    const options = () =>
      within(sort)
        .getAllByRole("option")
        .map((o) => o.textContent?.trim());

    expect(options()).toEqual(["Più recenti", "Titolo"]);

    await fireEvent.focus(searchBox());
    await type("limbo");
    await waitFor(() => expect(titles()).toEqual(["Il limbo dei processi", "Le vibrazioni"]));
    expect(options()).toEqual(["Più recenti", "Titolo", "Pertinenza"]);
    expect((sort as HTMLSelectElement).value).toBe("pertinenza");
  });

  it("sorts by title when asked, in the URL too", async () => {
    renderBrowser();

    await fireEvent.update(screen.getByRole("combobox", { name: "Ordina per" }), "titolo");

    expect(titles()[0]).toBe("Il limbo dei processi");
    expect(window.location.search).toBe("?ordine=titolo");
  });

  it("shows the empty state, and resets everything from there", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => undefined)),
    );
    renderBrowser();

    await type("zzzz");

    expect(status()).toBe("Nessun racconto qui, per ora.");
    expect(screen.queryAllByRole("heading", { level: 2 })).toEqual([]);

    await fireEvent.click(screen.getByRole("button", { name: "Azzera ricerca e filtri" }));

    expect(status()).toBe("4 racconti");
    expect((searchBox() as HTMLInputElement).value).toBe("");
    expect(window.location.search).toBe("");
  });

  it("folds the filters under a button on phones, which counts the active ones", async () => {
    renderBrowser();
    const toggle = screen.getByRole("button", { name: "Filtri" });
    const panel = document.getElementById(toggle.getAttribute("aria-controls") ?? "");

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(panel?.className).toContain("hidden");
    expect(panel?.className).toContain("lg:flex");

    await fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");

    await fireEvent.click(chip("Pisa"));
    expect(screen.getByRole("button", { name: "Filtri (1)" })).toBe(toggle);

    await fireEvent.click(screen.getByRole("button", { name: "Azzera i filtri" }));
    expect(window.location.search).toBe("");
  });
});

describe("SearchBrowser on the books", () => {
  function renderBooks() {
    window.history.replaceState(null, "", "/libri");
    return render(SearchBrowser, {
      props: { kind: "books", items: bookItems, facets: bookFacets },
    });
  }
  const bookTitles = () =>
    screen.getAllByRole("listitem").flatMap((item) => {
      const title = item.querySelector("p.italic")?.textContent?.trim();
      return title === undefined ? [] : [title];
    });

  it("lists every book by author, counting books", () => {
    renderBooks();

    expect(bookTitles()).toEqual([
      "The Art and Business of Online Writing",
      "Misery",
      "Il miglio verde",
      "On Writing",
      "Dracula",
    ]);
    expect(status()).toBe("5 libri");
    expect(screen.getByRole("searchbox", { name: "Cerca fra i libri" })).toBeTruthy();
  });

  it("filters by author and writes the URL", async () => {
    renderBooks();

    await fireEvent.click(chip("Stephen King"));

    expect(status()).toBe("3 libri");
    expect(window.location.search).toBe("?autore=stephen-king");
    expect(screen.getByRole("button", { name: "Scrittura 1 libro" })).toBeTruthy();
  });

  it("searches by prefix, without downloading any index", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderBooks();
    const box = screen.getByRole("searchbox", { name: "Cerca fra i libri" });

    await fireEvent.focus(box);
    await fireEvent.update(box, "green");
    vi.advanceTimersByTime(250);
    await nextTick();

    expect(bookTitles()).toEqual(["Il miglio verde"]);
    expect(fetchMock).not.toHaveBeenCalled();
    // No relevance order without an index, even while searching.
    const sort = screen.getByRole("combobox", { name: "Ordina per" });
    expect(
      within(sort)
        .getAllByRole("option")
        .map((o) => o.textContent?.trim()),
    ).toEqual(["Autore", "Titolo", "Anno"]);
  });

  it("sorts by year, oldest first", async () => {
    renderBooks();

    await fireEvent.update(screen.getByRole("combobox", { name: "Ordina per" }), "anno");

    expect(bookTitles()[0]).toBe("Dracula");
    expect(window.location.search).toBe("?ordine=anno");
  });

  it("says plainly when nothing matches", async () => {
    renderBooks();
    const box = screen.getByRole("searchbox", { name: "Cerca fra i libri" });

    await fireEvent.update(box, "zzzz");
    vi.advanceTimersByTime(250);
    await nextTick();

    expect(status()).toBe("Nessun libro qui, per ora.");
  });
});
