/**
 * Reading and writing a piece of UI state in the query string, through a
 * zod schema: `?q=nebbia&luogo=mugello&luogo=pisa` ⇄
 * `{ q: "nebbia", luogo: ["mugello", "pisa"], … }`.
 *
 * Why the URL holds the state (PLAN › Ricerca): a filtered archive can be
 * bookmarked and shared, the story pages can link to one
 * (`/racconti?luogo=mugello`), and the browser's back button undoes a
 * filter.
 *
 * Why a schema: the query string is input from outside. Anyone can type
 * `?luogo=<script>` or `?ordine=caso`. The schema turns whatever arrives
 * into a state the island can trust: unknown values are dropped, a broken
 * parameter falls back to its default, and parsing never throws.
 *
 * This file uses `zod/mini`, the tree-shakable build of zod: the same
 * schemas, written as functions (`z.optional(x)` instead of
 * `x.optional()`), so the browser downloads only the pieces used here, a
 * few kilobytes instead of the whole library. (The reading-progress
 * controller has no zod at all for the same reason; the island already
 * ships Vue, and a declarative schema is worth a few kilobytes here.)
 *
 * The composable that ties this to Vue and to the browser history is
 * useUrlState.ts; everything here is pure and tested without a browser.
 */
import * as z from "zod/mini";

/**
 * Every parameter arrives as the list of its values, as
 * `URLSearchParams.getAll()` returns it: `[]` when absent, two entries for
 * `?luogo=a&luogo=b`. Each field schema below starts from that list.
 */
type ParamValues = string[];

/** A field of a URL schema: a list of raw values in, any value out. */
type ParamSchema = z.ZodMiniType<unknown, ParamValues>;

/** A schema describing a whole query string, one field per parameter. */
export type UrlSchema = z.ZodMiniObject<Record<string, ParamSchema>>;

const values = () => z.array(z.string());

/** Builders for the fields of a URL schema. */
export const param = {
  /**
   * Free text (the search query): the first value, trimmed and cut to
   * `maxLength` characters, `""` when absent. The cap keeps a pasted novel
   * out of the URL and out of the search.
   */
  text(maxLength = 100) {
    return z.pipe(
      values(),
      z.transform((list: ParamValues) => (list[0] ?? "").trim().slice(0, maxLength).trimEnd()),
    );
  },

  /**
   * A set of known ids (the values of a facet): unknown ids and repeats
   * are dropped one by one, the rest keeps the URL's order. `[]` when
   * absent.
   */
  list(allowed: readonly string[]) {
    const known = new Set(allowed);
    return z.pipe(
      values(),
      z.transform((list: ParamValues) => [...new Set(list)].filter((id) => known.has(id))),
    );
  },

  /**
   * One value out of a fixed set (the sort order), or `undefined` when it
   * is absent or not in the set, so the caller can tell «not chosen» from
   * a choice and apply its own default.
   */
  choice<const T extends readonly [string, ...string[]]>(options: T) {
    return z.catch(
      z.pipe(
        z.pipe(
          values(),
          z.transform((list: ParamValues) => list[0]),
        ),
        z.optional(z.enum(options)),
      ),
      undefined,
    );
  },
};

/** The state a schema describes. */
export type UrlState<S extends UrlSchema> = z.output<S>;

/** The parameter names a schema owns. */
function keysOf(schema: UrlSchema): string[] {
  return Object.keys(schema.shape);
}

/**
 * Reads the state described by `schema` from a query string (`"?q=x"`,
 * `"q=x"` or a `URLSearchParams`). Parameters the schema does not know are
 * ignored; the schema's fields cannot fail, so this never throws.
 */
export function readParams<S extends UrlSchema>(
  schema: S,
  search: string | URLSearchParams,
): UrlState<S> {
  const params = new URLSearchParams(search);
  const raw = Object.fromEntries(keysOf(schema).map((key) => [key, params.getAll(key)]));
  return schema.parse(raw);
}

/** The state of an empty query string: every field at its default. */
export function defaultParams<S extends UrlSchema>(schema: S): UrlState<S> {
  return readParams(schema, "");
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Writes `state` into a copy of `current`, the page's existing query
 * string. Each field of the schema is replaced; a field at its default is
 * left out entirely, so the plain archive stays `/racconti` and not
 * `/racconti?q=&ordine=`. Parameters the schema does not own (say, a
 * `utm_source` from an Instagram link) are kept as they were.
 */
export function writeParams<S extends UrlSchema>(
  schema: S,
  state: UrlState<S>,
  current: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  const defaults: Record<string, unknown> = defaultParams(schema);
  const next = new URLSearchParams(current);
  const entries: Record<string, unknown> = state;

  for (const key of keysOf(schema)) {
    next.delete(key);
    const value = entries[key];
    if (value === undefined || sameValue(value, defaults[key])) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      next.append(key, String(item));
    }
  }
  return next;
}
