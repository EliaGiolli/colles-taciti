/**
 * Renders an Astro component to a DOM `Document`, for tests.
 *
 * Uses Astro's Container API, which is still experimental
 * (`experimental_AstroContainer`, see docs/PLAN.md › change log). Every test
 * goes through this helper instead of importing the API directly, so when the
 * API is renamed or stabilised only this file changes.
 *
 * The returned `Document` can be queried with Testing Library
 * (`getByRole(doc.body, "heading")`).
 *
 * Important: test files using this helper must run in the default **Node**
 * environment, never with `// @vitest-environment jsdom`. In a browser-like
 * environment Vite compiles `.astro` files for the client, and Astro refuses
 * to render them ("Astro components cannot be used in the browser"). So the
 * component is rendered on the server side, and a standalone JSDOM instance
 * is created here only to parse the resulting HTML.
 *
 * @see https://docs.astro.build/en/reference/container-reference/
 */

import { loadRenderers } from "astro:container";
import { getContainerRenderer as getVueRenderer } from "@astrojs/vue/container-renderer";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { JSDOM } from "jsdom";

// A class name is also the type of its instances. (`InstanceType<typeof …>`
// would not work here: the container's constructor is private, by design,
// so instances can only come from `AstroContainer.create()`.)
type RenderToString = AstroContainer["renderToString"];

/** Any `.astro` component, as accepted by the container. */
export type AstroComponent = Parameters<RenderToString>[0];

/** Props, slots and request options, as accepted by the container. */
export type RenderOptions = Parameters<RenderToString>[1];

/**
 * The container is created once and reused: creating it loads the renderers,
 * which is the slow part. Rendering itself is stateless.
 */
let containerPromise: Promise<AstroContainer> | undefined;

function getContainer(): Promise<AstroContainer> {
  containerPromise ??= loadRenderers([getVueRenderer()]).then((renderers) =>
    AstroContainer.create({ renderers }),
  );
  return containerPromise;
}

/** Renders `component` and returns its HTML as a string. */
export async function renderAstroToString(
  component: AstroComponent,
  options?: RenderOptions,
): Promise<string> {
  const container = await getContainer();
  return container.renderToString(component, options);
}

/** Renders `component` and parses the result into a `Document`. */
export async function renderAstro(
  component: AstroComponent,
  options?: RenderOptions,
): Promise<Document> {
  const html = await renderAstroToString(component, options);
  return new JSDOM(html).window.document;
}
