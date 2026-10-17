// @vitest-environment jsdom
/**
 * Tests for consent, GA4 loading and event tracking, together: the banner
 * controller decides, gtag.ts loads, track.ts sends only after a yes.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { disableAnalytics, enableAnalytics } from "@/core/analytics/gtag";
import { track } from "@/core/analytics/track";
import { CONSENT_STORAGE_KEY } from "../constants/consent";
import { connect } from "./consent.controller";

const ID = "G-TEST";
const gaScripts = () => document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');

function setup() {
  document.body.innerHTML = `
    <main id="contenuto" tabindex="-1"></main>
    <button data-consent-open>Preferenze cookie</button>
    <a href="https://www.wattpad.com/x" data-track="wattpad_click" data-track-story="senza-rimorso">W</a>
    <section data-controller="consent" data-ga-id="${ID}" hidden>
      <button data-consent="granted">Accetta</button>
      <button data-consent="denied">Rifiuta</button>
    </section>`;
  const banner = document.querySelector<HTMLElement>("[data-controller]") as HTMLElement;
  const disconnect = connect(banner);
  const click = (selector: string) => document.querySelector<HTMLElement>(selector)?.click();
  return { banner, disconnect, click };
}

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = "";
  delete window.gtag;
  delete window.dataLayer;
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("consent controller", () => {
  it("asks when no choice is saved, and loads nothing meanwhile", () => {
    const { banner } = setup();

    expect(banner.hidden).toBe(false);
    expect(gaScripts()).toHaveLength(0);
    expect(window.gtag).toBeUndefined();
  });

  it("starts GA4 on «Accetta», saves it, and moves the focus to the content", () => {
    const { banner, click } = setup();

    click('[data-consent="granted"]');

    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("granted");
    expect(banner.hidden).toBe(true);
    expect(gaScripts()).toHaveLength(1);
    expect(document.activeElement?.id).toBe("contenuto");
  });

  it("loads nothing on «Rifiuta», and stays quiet on the next visit", () => {
    setup().click('[data-consent="denied"]');
    expect(gaScripts()).toHaveLength(0);

    const { banner } = setup();
    expect(banner.hidden).toBe(true);
    expect(gaScripts()).toHaveLength(0);
  });

  it("starts GA4 straight away for a reader who said yes before", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    const { banner } = setup();

    expect(banner.hidden).toBe(true);
    expect(gaScripts()).toHaveLength(1);
  });

  it("reopens from «Preferenze cookie»", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "denied");
    const { banner, click } = setup();

    click("[data-consent-open]");

    expect(banner.hidden).toBe(false);
    expect(document.activeElement?.textContent).toBe("Accetta");
  });
});

describe("gtag and track", () => {
  it("queues consent denied by default, then grants analytics only", () => {
    enableAnalytics(window, ID);
    const commands = (window.dataLayer ?? []).map((entry) => [...(entry as IArguments)]);

    expect(commands[0]).toEqual([
      "consent",
      "default",
      {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      },
    ]);
    expect(commands[1]).toEqual(["consent", "update", { analytics_storage: "granted" }]);
    expect(commands.at(-1)).toEqual(["config", ID]);
  });

  it("tracks events only once GA4 is on", () => {
    track("story_start", { story_id: "senza-rimorso" });
    expect(window.dataLayer).toBeUndefined();

    enableAnalytics(window, ID);
    track("story_start", { story_id: "senza-rimorso" });
    const last = [...((window.dataLayer ?? []).at(-1) as IArguments)];
    expect(last).toEqual(["event", "story_start", { story_id: "senza-rimorso" }]);
  });

  it("tracks a data-track link click", () => {
    const { click } = setup();
    click('[data-consent="granted"]');

    click("[data-track]");

    const last = [...((window.dataLayer ?? []).at(-1) as IArguments)];
    expect(last).toEqual(["event", "wattpad_click", { story_id: "senza-rimorso" }]);
  });

  it("turns analytics off and deletes the GA cookies after a change of mind", () => {
    enableAnalytics(window, ID);
    document.cookie = "_ga=GA1.1.123; path=/";

    disableAnalytics(window);

    const last = [...((window.dataLayer ?? []).at(-1) as IArguments)];
    expect(last).toEqual(["consent", "update", { analytics_storage: "denied" }]);
    expect(document.cookie).not.toContain("_ga=");
  });
});
