/**
 * The Astro Actions of the site, by name. Astro looks for this file and
 * exposes each action at `/_actions/<name>` and as `actions.<name>` from
 * `astro:actions`. The actions themselves live in their features.
 *
 * @see https://docs.astro.build/en/guides/actions/
 */
import { feedback } from "@/features/feedback";

export const server = { feedback };
