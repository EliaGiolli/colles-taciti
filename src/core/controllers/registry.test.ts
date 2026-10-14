// @vitest-environment jsdom
/**
 * Unit tests for the controller registry.
 *
 * The pure helpers are tested with plain values; `connectControllers` runs
 * against a small jsdom document with fake controller modules, so no real
 * controller (and no bundler) is involved.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type ControllerLoader,
  type ControllerModule,
  connectControllers,
  controllerNameFromPath,
  createLoaderMap,
  isControllerModule,
  parseControllerNames,
} from "./registry";

/** Builds a fake controller whose `connect` and cleanup are spies. */
function fakeController() {
  const disconnect = vi.fn();
  const connect = vi.fn((_element: HTMLElement) => disconnect);
  const module: ControllerModule = { connect };
  return { module, connect, disconnect };
}

/** Wraps a module in a loader spy, like `import.meta.glob` would. */
function loaderFor(module: unknown) {
  return vi.fn<ControllerLoader>(() => Promise.resolve(module));
}

function render(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("controllerNameFromPath", () => {
  it("uses the file name without the suffix", () => {
    expect(controllerNameFromPath("/src/core/theme/theme-toggle.controller.ts")).toBe(
      "theme-toggle",
    );
  });

  it("ignores the folder", () => {
    expect(
      controllerNameFromPath(
        "/src/features/stories/reading-progress/reading-progress.controller.ts",
      ),
    ).toBe("reading-progress");
  });

  it.each([
    "/src/core/theme/theme-toggle.ts",
    "/src/core/theme/theme-toggle.controller.test.ts",
    "/src/core/.controller.ts",
  ])("rejects %s", (path) => {
    expect(() => controllerNameFromPath(path)).toThrow(/Not a controller file/);
  });
});

describe("createLoaderMap", () => {
  it("maps names to loaders", () => {
    const load = loaderFor({});
    const map = createLoaderMap({ "/src/core/theme/theme-toggle.controller.ts": load });
    expect([...map.keys()]).toEqual(["theme-toggle"]);
    expect(map.get("theme-toggle")).toBe(load);
  });

  it("fails on two files with the same name", () => {
    expect(() =>
      createLoaderMap({
        "/src/core/a/menu.controller.ts": loaderFor({}),
        "/src/features/b/menu.controller.ts": loaderFor({}),
      }),
    ).toThrow(/Duplicate controller name "menu"/);
  });
});

describe("parseControllerNames", () => {
  it.each([
    [null, []],
    [undefined, []],
    ["", []],
    ["   ", []],
    ["theme-toggle", ["theme-toggle"]],
    ["  a\tb\n a ", ["a", "b"]],
  ])("parses %j", (value, expected) => {
    expect(parseControllerNames(value)).toEqual(expected);
  });
});

describe("isControllerModule", () => {
  it.each([
    [{ connect: () => () => {} }, true],
    [{ connect: "nope" }, false],
    [{}, false],
    [null, false],
    ["module", false],
  ])("checks %j", (module, expected) => {
    expect(isControllerModule(module)).toBe(expected);
  });
});

describe("connectControllers", () => {
  it("connects every element that names a controller", async () => {
    const root = render(`
      <button data-controller="toggle" id="one"></button>
      <button data-controller="toggle" id="two"></button>
      <p>no controller here</p>
    `);
    const toggle = fakeController();

    await connectControllers(root, new Map([["toggle", loaderFor(toggle.module)]]));

    expect(toggle.connect).toHaveBeenCalledTimes(2);
    expect(toggle.connect.mock.calls.map(([element]) => element.id)).toEqual(["one", "two"]);
  });

  it("imports each module once, however many elements use it", async () => {
    const root = render(`<i data-controller="toggle"></i><i data-controller="toggle"></i>`);
    const load = loaderFor(fakeController().module);

    await connectControllers(root, new Map([["toggle", load]]));

    expect(load).toHaveBeenCalledTimes(1);
  });

  it("supports several controllers on one element", async () => {
    const root = render(`<article data-controller="controls progress"></article>`);
    const controls = fakeController();
    const progress = fakeController();

    await connectControllers(
      root,
      new Map([
        ["controls", loaderFor(controls.module)],
        ["progress", loaderFor(progress.module)],
      ]),
    );

    expect(controls.connect).toHaveBeenCalledOnce();
    expect(progress.connect).toHaveBeenCalledOnce();
  });

  it("never imports controllers the page does not use", async () => {
    const root = render(`<i data-controller="used"></i>`);
    const unused = loaderFor(fakeController().module);

    await connectControllers(
      root,
      new Map([
        ["used", loaderFor(fakeController().module)],
        ["unused", unused],
      ]),
    );

    expect(unused).not.toHaveBeenCalled();
  });

  it("reports failures without stopping the other controllers", async () => {
    const root = render(`
      <i data-controller="missing"></i>
      <i data-controller="no-connect"></i>
      <i data-controller="rejects"></i>
      <i data-controller="throws"></i>
      <i data-controller="works"></i>
    `);
    const works = fakeController();
    const onError = vi.fn();

    await connectControllers(
      root,
      new Map<string, ControllerLoader>([
        ["no-connect", loaderFor({ default: () => {} })],
        ["rejects", () => Promise.reject(new Error("network down"))],
        [
          "throws",
          loaderFor({
            connect: () => {
              throw new Error("boom");
            },
          }),
        ],
        ["works", loaderFor(works.module)],
      ]),
      { onError },
    );

    expect(works.connect).toHaveBeenCalledOnce();
    expect(onError.mock.calls.map(([, name]) => name).sort()).toEqual([
      "missing",
      "no-connect",
      "rejects",
      "throws",
    ]);
    expect(String(onError.mock.calls.find(([, name]) => name === "missing")?.[0])).toMatch(
      /Unknown controller/,
    );
  });

  it("does not connect the same controller twice to an element", async () => {
    const root = render(`<i data-controller="toggle"></i>`);
    const toggle = fakeController();
    const loaders = new Map([["toggle", loaderFor(toggle.module)]]);

    await connectControllers(root, loaders);
    await connectControllers(root, loaders);

    expect(toggle.connect).toHaveBeenCalledOnce();
  });

  it("returns a function that runs every cleanup and allows reconnecting", async () => {
    const root = render(`<i data-controller="toggle"></i>`);
    const toggle = fakeController();
    const loaders = new Map([["toggle", loaderFor(toggle.module)]]);

    const disconnect = await connectControllers(root, loaders);
    disconnect();
    expect(toggle.disconnect).toHaveBeenCalledOnce();

    await connectControllers(root, loaders);
    expect(toggle.connect).toHaveBeenCalledTimes(2);
  });
});
