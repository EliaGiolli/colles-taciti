/**
 * `track()`: the reading events the site sends to GA4 (PLAN › Analytics),
 * typed so a misspelt event or a missing parameter is a compile error.
 *
 * It sends only if gtag exists, and gtag exists only after the reader
 * accepted analytics (gtag.ts). Without consent, or without JavaScript,
 * every call is a silent no-op: features call `track()` freely and never
 * check consent themselves.
 *
 * `story_id` is the story's slug, or `homepage` for the homepage form.
 */

/** Every event and its parameters. */
export interface AnalyticsEvents {
  /** The reader got past the first lines (the same 2% that starts saving progress). */
  story_start: { story_id: string };
  /** «La paura dietro il racconto» reached the reading line. */
  story_finish: { story_id: string };
  feedback_submit: { story_id: string };
  wattpad_click: { story_id: string };
  /** «Riprendi» on the story page, or «Stai leggendo» on the homepage. */
  resume_reading: { story_id: string; source: "story" | "home" };
}

export type AnalyticsEvent = keyof AnalyticsEvents;

/** Sends `event` to GA4, if the reader allowed it. */
export function track<E extends AnalyticsEvent>(event: E, params: AnalyticsEvents[E]): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
}

/** Events a link can send by itself, with `data-track` (see consent.controller.ts). */
const CLICK_EVENTS = ["wattpad_click"] as const;
type ClickEvent = (typeof CLICK_EVENTS)[number];

function isClickEvent(name: string | undefined): name is ClickEvent {
  return CLICK_EVENTS.some((event) => event === name);
}

/**
 * Tracks clicks on links marked `data-track="<event>"` with
 * `data-track-story="<slug>"`, for links that have no controller of their
 * own (the Wattpad link). One listener on the document covers them all.
 */
export function trackLinkClicks(doc: Document): () => void {
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest<HTMLElement>("[data-track]");
    const name = link?.dataset["track"];
    const story = link?.dataset["trackStory"];
    if (isClickEvent(name) && story) track(name, { story_id: story });
  };
  doc.addEventListener("click", onClick);
  return () => doc.removeEventListener("click", onClick);
}
