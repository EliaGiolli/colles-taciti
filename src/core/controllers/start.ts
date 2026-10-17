/**
 * Browser entry point of the controller registry.
 *
 * Imported once per page from a `<script>` in the layout. Astro bundles that
 * script as a deferred ES module, so it runs after the HTML has been parsed:
 * no `DOMContentLoaded` listener is needed.
 *
 * `import.meta.glob` is resolved by Vite at build time: it lists every
 * `*.controller.ts` file under `src/` and replaces each with a lazy
 * `() => import("…")`. Nothing is downloaded until `connectControllers` finds
 * an element that names the controller. Discovering files by convention also
 * keeps `core` from importing `features` directly, which the architecture
 * rules forbid.
 */
import { connectControllers, createLoaderMap } from "./helpers/registry";

const modules = import.meta.glob("/src/**/*.controller.ts");

// The returned disconnect function is not needed: controllers live as long as
// the page, and a navigation replaces the whole document.
void connectControllers(document, createLoaderMap(modules));
