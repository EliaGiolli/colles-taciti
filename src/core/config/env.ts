/**
 * The environment variables the site reads, as an `astro:env` schema
 * (wired in astro.config.ts). Astro validates them and exposes them typed
 * through `astro:env/server`, so code never reads `process.env` by hand.
 *
 * The first four are server secrets: they never reach the browser bundle.
 * `PUBLIC_GA_ID` is public (it is in every page's HTML anyway). All are
 * optional so that the static build (and CI) runs without them; the code
 * that needs one checks for it and fails or degrades with a clear reason:
 * - no database URL: the feedback action answers with an error;
 * - no Resend key or recipient: feedback is saved but not e-mailed
 *   (`delivered` stays false, nothing is lost).
 *
 * @see https://docs.astro.build/en/guides/environment-variables/
 */
import { envField } from "astro/config";

const secret = () => envField.string({ context: "server", access: "secret", optional: true });

export const envSchema = {
  /** `libsql://….turso.io` in production; `file:local.db` works locally. */
  TURSO_DATABASE_URL: secret(),
  /** Not needed for a `file:` database. */
  TURSO_AUTH_TOKEN: secret(),
  RESEND_API_KEY: secret(),
  /** Where feedback e-mails go (Elia's inbox). */
  FEEDBACK_TO: secret(),
  /** GA4 measurement ID (`G-…`). Without it there is no banner and no analytics. */
  PUBLIC_GA_ID: envField.string({ context: "client", access: "public", optional: true }),
};
