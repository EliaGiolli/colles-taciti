/**
 * The Content Security Policy (astro.config.ts › security.csp) on the
 * production build: no page may trigger a violation, through the paths
 * that run the most code (the island hydrating and searching, the story
 * controllers, GA4 loading after consent, the feedback form).
 *
 * A blocked script usually breaks something the other tests would notice;
 * a blocked style or image may not. This test listens for the browser's
 * `securitypolicyviolation` events directly, so any violation fails it,
 * visible or not.
 */
import { expect, type Page, test } from "@playwright/test";

// Start without a saved consent choice, so the banner shows and GA can load.
test.use({ storageState: { cookies: [], origins: [] } });

/** Collects every CSP violation of the page, from the first script on. */
async function watchViolations(page: Page): Promise<() => Promise<string[]>> {
  await page.addInitScript(() => {
    const seen: string[] = [];
    Object.assign(window, { __cspViolations: seen });
    document.addEventListener("securitypolicyviolation", (event) => {
      seen.push(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  return () =>
    page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations);
}

test("no page breaks the Content Security Policy", async ({ page }) => {
  // Google's servers are not called for real: answer with an empty script.
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) =>
    route.fulfill({ body: "", contentType: "text/javascript" }),
  );
  const violations = await watchViolations(page);

  await page.goto("/");
  await expect(page.locator("meta[http-equiv='content-security-policy']")).toHaveCount(1);
  const gtagLoaded = page.waitForRequest(/googletagmanager\.com/);
  await page.getByRole("button", { name: "Accetta" }).click();
  await gtagLoaded;
  expect(await violations()).toEqual([]);

  await page.goto("/racconti");
  await expect(page.locator("astro-island")).not.toHaveAttribute("ssr");
  await page.getByRole("searchbox", { name: "Cerca fra i racconti" }).fill("nebbia");
  await page.waitForResponse(/search-index\.json/);
  expect(await violations()).toEqual([]);

  for (const path of [
    "/racconti/il-limbo-dei-processi",
    "/libri",
    "/slasher",
    "/una-pagina-che-non-c-e",
  ]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await violations(), path).toEqual([]);
  }
});
