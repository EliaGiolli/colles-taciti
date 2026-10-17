/**
 * A small client for Open Library (https://openlibrary.org), the free
 * catalogue of the Internet Archive: it finds a book's work, its year of
 * first publication and its cover.
 *
 * Used only by `bun run libri:sync` (scripts/libri-sync.ts), never by the
 * site: the sync writes what it finds into books.json and public/libri,
 * and the build reads those files. Why Open Library and not Google Books
 * (PLAN › Libri, «in alternativa Google Books»): no API key, no quota to
 * manage, and covers that may be downloaded and served from the site.
 *
 * Two endpoints:
 * - the search API, `search.json`, by title and author or by work id
 *   (`q=key:/works/OL…W`), asking only for the fields we read;
 * - the covers API, `covers.openlibrary.org/b/id/<cover>-M.jpg`, where M
 *   is the medium size (about 180px wide: enough for a 96px slot on a
 *   screen with twice the pixels). `default=false` makes a missing cover a
 *   404 instead of a blank placeholder image.
 *
 * The answers are external input, so they go through a zod schema: a
 * field that changed shape upstream becomes «no data» for that field, not
 * a crash halfway through the sync.
 */
import { z } from "astro/zod";
import { normalizeText } from "@/shared/lib/normalize-text";

const SEARCH_URL = "https://openlibrary.org/search.json";
const COVERS_URL = "https://covers.openlibrary.org/b/id";

/**
 * Open Library asks scripts to identify themselves, so that a misbehaving
 * client can be told apart (and contacted) rather than blocked.
 */
export const USER_AGENT = "colles-taciti libri:sync (https://colles-taciti.vercel.app)";

/** The fields asked of the search API; anything else in the answer is ignored. */
const FIELDS = ["key", "title", "first_publish_year", "cover_i", "edition_count"] as const;

const searchDoc = z.object({
  /** `/works/OL81613W` */
  key: z.string(),
  title: z.string(),
  first_publish_year: z.number().int().optional().catch(undefined),
  cover_i: z.number().int().positive().optional().catch(undefined),
  edition_count: z.number().int().optional().catch(undefined),
});
type SearchDoc = z.infer<typeof searchDoc>;

const searchResponse = z.object({ docs: z.array(z.unknown()) });

/** What the sync needs to know about a work. */
export interface WorkMatch {
  /** `OL81613W` */
  workId: string;
  title: string;
  year?: number | undefined;
  coverId?: number | undefined;
}

/** How to look a book up: by title and author, or by a known work id. */
export type WorkQuery = { title: string; author: string } | { workId: string };

/** The `fetch` the client uses: the global one, or a test double. */
export type Fetch = typeof fetch;

function searchParams(query: WorkQuery): URLSearchParams {
  const params = new URLSearchParams({ fields: FIELDS.join(","), limit: "10" });
  if ("workId" in query) {
    params.set("q", `key:/works/${query.workId}`);
  } else {
    params.set("title", query.title);
    params.set("author", query.author);
  }
  return params;
}

/**
 * The best of the search results for `title`. Open Library often holds the
 * same book several times (a translation filed as its own work, a split
 * edition such as «It [1/2]»). An exact title match wins over the rest,
 * and among exact matches the work with the most editions, which is the
 * one the catalogue treats as canonical. Without an exact match, the
 * search's own first result.
 */
export function pickWork(docs: readonly SearchDoc[], title: string): SearchDoc | undefined {
  const wanted = normalizeText(title);
  const exact = docs.filter((doc) => normalizeText(doc.title) === wanted);
  if (exact.length === 0) return docs[0];
  return [...exact].sort((a, b) => (b.edition_count ?? 0) - (a.edition_count ?? 0))[0];
}

/**
 * Finds a work on Open Library, or `null` when nothing matches. Throws on
 * a network error or an HTTP error: the sync reports it and moves on to
 * the next book.
 */
export async function findWork(
  query: WorkQuery,
  fetchFn: Fetch = fetch,
): Promise<WorkMatch | null> {
  const response = await fetchFn(`${SEARCH_URL}?${searchParams(query)}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Open Library: HTTP ${response.status}`);

  const { docs } = searchResponse.parse(await response.json());
  const valid = docs.flatMap((doc) => {
    const parsed = searchDoc.safeParse(doc);
    return parsed.success ? [parsed.data] : [];
  });
  const doc = "workId" in query ? valid[0] : pickWork(valid, query.title);
  if (doc === undefined) return null;

  return {
    workId: doc.key.replace(/^\/works\//, ""),
    title: doc.title,
    year: doc.first_publish_year,
    coverId: doc.cover_i,
  };
}

/** The address of a cover in the medium size. */
export function coverUrl(coverId: number): string {
  return `${COVERS_URL}/${coverId}-M.jpg?default=false`;
}

/**
 * Downloads a cover as JPEG bytes, or `null` when Open Library has no
 * image under that id (404). Throws on other errors.
 */
export async function downloadCover(
  coverId: number,
  fetchFn: Fetch = fetch,
): Promise<Uint8Array | null> {
  const response = await fetchFn(coverUrl(coverId), { headers: { "User-Agent": USER_AGENT } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Open Library covers: HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}
