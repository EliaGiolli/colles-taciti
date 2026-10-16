/**
 * End-to-end checks of the feedback form on the production build (Node
 * adapter, see playwright.config.ts): sent with JavaScript from a story,
 * and without JavaScript through /feedback. Each test reads the row back
 * from the e2e database file, so it proves the message was stored, and
 * stored there, not in the real database.
 */
import { createClient } from "@libsql/client";
import { expect, test } from "@playwright/test";
import { E2E_DATABASE_URL } from "../../playwright.config";

/** The newest row with this message, from the e2e database. */
async function findRow(message: string) {
  const client = createClient({ url: E2E_DATABASE_URL });
  const { rows } = await client.execute({
    sql: "SELECT story_slug, name, email FROM feedback WHERE message = ? ORDER BY id DESC LIMIT 1",
    args: [message],
  });
  client.close();
  return rows[0];
}

test("with JavaScript, the form is sent in place and answered with one line", async ({
  page,
}, testInfo) => {
  const message = `La chat mi è rimasta addosso (${testInfo.project.name}, ${Date.now()})`;
  await page.goto("/racconti/senza-rimorso");

  await page.getByRole("textbox", { name: "Cosa ti è rimasto" }).fill(message);
  await page.getByRole("textbox", { name: /^Nome/ }).fill("Marta");
  await page.getByRole("button", { name: "Invia" }).click();

  await expect(page.getByText("Ricevuto. Grazie per avermelo detto.")).toBeFocused();
  await expect(page).toHaveURL(/\/racconti\/senza-rimorso$/);
  expect(await findRow(message)).toMatchObject({ story_slug: "senza-rimorso", name: "Marta" });
});

test("without JavaScript, the form goes through /feedback and back", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const message = `Dalla homepage senza script (${testInfo.project.name}, ${Date.now()})`;
  await page.goto("/");

  await page.getByRole("textbox", { name: "Cosa ti è rimasto" }).fill(message);
  await page.getByRole("button", { name: "Invia" }).click();

  await expect(page).toHaveURL(/\/feedback\?_action=feedback$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ricevuto. Grazie per avermelo detto.",
  );
  await expect(page.getByRole("link", { name: "Torna alla homepage" })).toBeVisible();
  expect(await findRow(message)).toMatchObject({ story_slug: null, email: null });

  await context.close();
});

test("a direct visit to /feedback goes to the homepage", async ({ page }) => {
  await page.goto("/feedback");

  await expect(page).toHaveURL(/\/$/);
});
