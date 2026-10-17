// @vitest-environment jsdom
/**
 * Tests for the `useUrlState` composable: the state follows the URL on
 * mount and on back/forward, and `update()` writes the URL with the right
 * kind of history entry. Runs in jsdom, which has a real `history`.
 */
import { cleanup, render } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import * as z from "zod/mini";
import { param } from "../helpers/url-state";
import { type UrlStateHandle, useUrlState } from "./useUrlState";

const schema = z.object({ q: param.text(), luogo: param.list(["mugello", "pisa"]) });

/** Mounts a component that uses the composable and hands back its handle. */
function mountWithUrlState(onRead?: (state: { q: string }) => void) {
  let handle: UrlStateHandle<typeof schema> | undefined;
  const Probe = defineComponent({
    setup() {
      handle = useUrlState(schema, onRead);
      return () => h("p", handle?.state.value.q);
    },
  });
  const result = render(Probe);
  if (handle === undefined) throw new Error("the composable did not run");
  return { ...result, handle };
}

beforeEach(() => {
  window.history.replaceState(null, "", "/racconti");
});
afterEach(() => {
  cleanup();
});

describe("useUrlState", () => {
  it("reads the URL once mounted", () => {
    window.history.replaceState(null, "", "/racconti?q=nebbia&luogo=pisa");
    const seen: string[] = [];
    const { handle } = mountWithUrlState((state) => seen.push(state.q));

    expect(handle.state.value).toEqual({ q: "nebbia", luogo: ["pisa"] });
    expect(seen).toEqual(["nebbia"]);
  });

  it("pushes a history entry for a filter, and replaces it for typing", () => {
    const { handle } = mountWithUrlState();
    const before = window.history.length;

    handle.update({ luogo: ["mugello"] });
    expect(window.location.search).toBe("?luogo=mugello");
    expect(window.history.length).toBe(before + 1);

    handle.update({ q: "nebbia" }, "replace");
    // Always in the schema's order, whatever was changed first.
    expect(window.location.search).toBe("?q=nebbia&luogo=mugello");
    expect(window.history.length).toBe(before + 1);
  });

  it("keeps the path, the hash and foreign parameters, and skips no-op writes", () => {
    window.history.replaceState(null, "", "/racconti?utm_source=instagram#elenco");
    const { handle } = mountWithUrlState();
    const before = window.history.length;

    handle.update({ luogo: [] });
    expect(window.history.length).toBe(before);

    handle.update({ luogo: ["pisa"] });
    expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe(
      "/racconti?utm_source=instagram&luogo=pisa#elenco",
    );
  });

  it("follows the back and forward buttons", () => {
    const { handle } = mountWithUrlState();
    handle.update({ luogo: ["pisa"] });

    // What the browser does on «back»: the URL changes, then `popstate` fires.
    window.history.replaceState(null, "", "/racconti");
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(handle.state.value.luogo).toEqual([]);
  });

  it("stops listening once unmounted", () => {
    const { handle, unmount } = mountWithUrlState();
    unmount();

    window.history.replaceState(null, "", "/racconti?q=dopo");
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(handle.state.value.q).toBe("");
  });
});
