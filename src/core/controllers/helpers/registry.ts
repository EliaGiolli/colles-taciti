/**
 * Controller registry: attaches TypeScript behaviour to server-rendered HTML.
 *
 * The pattern is the one popularised by Stimulus and Alpine (HTML first,
 * behaviour attached afterwards), without a library:
 *
 * ```html
 * <button data-controller="theme-toggle">…</button>
 * ```
 *
 * finds `theme-toggle.controller.ts` anywhere under `src/`, imports it lazily
 * and calls its `connect(element)` function. An element can host several
 * controllers: `data-controller="reading-controls reading-progress"`.
 *
 * Why this design:
 * - **Zero runtime cost.** No framework is shipped; each page downloads only
 *   the controllers its markup actually names, because every controller is a
 *   separate chunk loaded with dynamic `import()`.
 * - **Strict-CSP friendly.** Behaviour lives in bundled module files, never in
 *   inline `onclick=""` attributes or `eval`-like template expressions.
 * - **Testable.** Everything here is a plain function: the pure helpers are
 *   tested without a DOM, `connectControllers` with jsdom.
 *
 * This module is pure (it never touches `document` at import time). The
 * browser entry point that wires it to the real page is `start.ts`.
 */
import { CONTROLLER_ATTRIBUTE, CONTROLLER_FILE_SUFFIX } from "../constants/controllers";

/** Undoes everything a controller did: removes listeners, observers, timers. */
export type Disconnect = () => void;

/**
 * The function every `*.controller.ts` module exports as `connect`.
 * It receives the element carrying `data-controller` and returns its cleanup.
 */
export type Connect = (element: HTMLElement) => Disconnect;

/** Shape of a controller module once it has been imported. */
export interface ControllerModule {
  connect: Connect;
}

/** Lazily imports one controller module (a dynamic `import()` under the hood). */
export type ControllerLoader = () => Promise<unknown>;

/** Controller name (e.g. `"theme-toggle"`) → loader of its module. */
export type ControllerLoaders = ReadonlyMap<string, ControllerLoader>;

/** Called when a controller cannot be loaded or connected. */
export type ControllerErrorHandler = (error: unknown, controllerName: string) => void;

/**
 * Derives a controller's name from its file path.
 *
 * `"/src/core/theme/theme-toggle.controller.ts"` → `"theme-toggle"`.
 * The name is the file name alone, not the folder, so moving a controller
 * between features does not change the markup that refers to it.
 *
 * @throws if the path does not end with {@link CONTROLLER_FILE_SUFFIX}.
 */
export function controllerNameFromPath(path: string): string {
  const fileName = path.split("/").at(-1) ?? "";
  if (!fileName.endsWith(CONTROLLER_FILE_SUFFIX) || fileName === CONTROLLER_FILE_SUFFIX) {
    throw new Error(
      `Not a controller file: "${path}" (expected "<name>${CONTROLLER_FILE_SUFFIX}")`,
    );
  }
  return fileName.slice(0, -CONTROLLER_FILE_SUFFIX.length);
}

/**
 * Turns the result of `import.meta.glob("/src/**\/*.controller.ts")` (file
 * path → loader) into a name → loader map.
 *
 * Two files with the same name in different folders would make
 * `data-controller="x"` ambiguous, so that is a hard error: it surfaces the
 * first time the page runs in development, not as a silent wrong behaviour.
 *
 * @throws if two controller files share the same name.
 */
export function createLoaderMap(
  modules: Readonly<Record<string, ControllerLoader>>,
): Map<string, ControllerLoader> {
  const loaders = new Map<string, ControllerLoader>();
  const pathsByName = new Map<string, string>();

  for (const [path, loader] of Object.entries(modules)) {
    const name = controllerNameFromPath(path);
    const existingPath = pathsByName.get(name);
    if (existingPath !== undefined) {
      throw new Error(
        `Duplicate controller name "${name}": "${existingPath}" and "${path}". Rename one of them.`,
      );
    }
    pathsByName.set(name, path);
    loaders.set(name, loader);
  }

  return loaders;
}

/**
 * Reads the controller names out of a `data-controller` value.
 * Names are separated by whitespace; duplicates are ignored, order is kept.
 *
 * `"reading-controls  reading-progress reading-controls"` →
 * `["reading-controls", "reading-progress"]`.
 */
export function parseControllerNames(value: string | null | undefined): string[] {
  if (value == null) return [];
  return [...new Set(value.split(/\s+/).filter((name) => name !== ""))];
}

/** Type guard: does an imported module export a `connect` function? */
export function isControllerModule(module: unknown): module is ControllerModule {
  return (
    typeof module === "object" &&
    module !== null &&
    "connect" in module &&
    typeof module.connect === "function"
  );
}

/**
 * Remembers which controllers are already attached to which element, so a
 * second call to {@link connectControllers} (for example from a test, or a
 * future partial re-render) never attaches the same behaviour twice.
 * A WeakMap lets removed elements be garbage-collected with their entry.
 */
const connectedControllers = new WeakMap<Element, Set<string>>();

/** Options for {@link connectControllers}. */
export interface ConnectControllersOptions {
  /**
   * Receives every load or connect failure. Defaults to `console.error`.
   * One broken controller must not stop the others, so errors are reported,
   * never thrown.
   */
  onError?: ControllerErrorHandler;
}

/**
 * Connects every `[data-controller]` element inside `root`.
 *
 * Each module is imported at most once per call, even when many elements use
 * it, and all imports run in parallel. The page is not scanned again later:
 * the site uses full-page navigations (native cross-document View
 * Transitions, no client-side router), so every page load runs this from
 * scratch and no element appears afterwards that would need connecting.
 *
 * @returns a function that disconnects everything this call connected.
 */
export async function connectControllers(
  root: ParentNode,
  loaders: ControllerLoaders,
  options: ConnectControllersOptions = {},
): Promise<Disconnect> {
  const onError = options.onError ?? defaultErrorHandler;
  const elements = [...root.querySelectorAll<HTMLElement>(`[${CONTROLLER_ATTRIBUTE}]`)];

  // Collect the work first: which element needs which controller.
  const pending: { element: HTMLElement; name: string }[] = [];
  for (const element of elements) {
    for (const name of parseControllerNames(element.getAttribute(CONTROLLER_ATTRIBUTE))) {
      if (!connectedControllers.get(element)?.has(name)) pending.push({ element, name });
    }
  }

  // Start one import per distinct controller name, all in parallel.
  const modules = new Map<string, Promise<ControllerModule | undefined>>();
  for (const { name } of pending) {
    if (!modules.has(name)) modules.set(name, loadController(name, loaders, onError));
  }

  const disconnects: Disconnect[] = [];
  for (const { element, name } of pending) {
    const module = await modules.get(name);
    if (module === undefined) continue; // Already reported by loadController.

    // The check is repeated after the await: another call may have connected
    // this element while the module was loading.
    const names = connectedControllers.get(element) ?? new Set<string>();
    if (names.has(name)) continue;

    try {
      const disconnect = module.connect(element);
      names.add(name);
      connectedControllers.set(element, names);
      disconnects.push(() => {
        disconnect();
        connectedControllers.get(element)?.delete(name);
      });
    } catch (error) {
      onError(error, name);
    }
  }

  return () => {
    for (const disconnect of disconnects) disconnect();
  };
}

/**
 * Imports one controller module and validates its shape.
 * Resolves to `undefined` (after reporting) instead of rejecting, so a single
 * failure cannot reject the whole `connectControllers` call.
 */
async function loadController(
  name: string,
  loaders: ControllerLoaders,
  onError: ControllerErrorHandler,
): Promise<ControllerModule | undefined> {
  const loader = loaders.get(name);
  if (loader === undefined) {
    onError(
      new Error(`Unknown controller "${name}": no ${name}${CONTROLLER_FILE_SUFFIX} under src/`),
      name,
    );
    return undefined;
  }

  try {
    const module = await loader();
    if (isControllerModule(module)) return module;
    onError(new Error(`Controller "${name}" does not export a connect(element) function`), name);
  } catch (error) {
    onError(error, name);
  }
  return undefined;
}

function defaultErrorHandler(error: unknown, controllerName: string): void {
  console.error(`[controllers] "${controllerName}" failed:`, error);
}
