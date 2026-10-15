/**
 * Tests for the chat and log blocks: the pure parsers, then the Sätteri
 * plugin end to end (Markdown in, HTML out), the way Astro runs it.
 */
import { pathToFileURL } from "node:url";
import { getAllByRole, getByRole } from "@testing-library/dom";
import { JSDOM } from "jsdom";
import { markdownToHtml } from "satteri";
import { describe, expect, it } from "vitest";
import { parseChat, parseChatOptions } from "./chat";
import { parseLog } from "./log";
import { BlockSyntaxError, parseMeta } from "./meta";
import { ctBlocks } from "./plugin";

/** Renders Markdown with the plugin and parses the HTML into a DOM body. */
function render(markdown: string): HTMLElement {
  const { html } = markdownToHtml(markdown, { mdastPlugins: [ctBlocks] });
  return new JSDOM(html).window.document.body;
}

const fence = (lang: string, body: string) => `Prosa.\n\n\`\`\`${lang}\n${body}\n\`\`\`\n`;

describe("parseMeta", () => {
  it("reads bare and quoted values", () => {
    expect(
      parseMeta('spettatori=12 etichetta="La chat di Alice"', ["spettatori", "etichetta"]),
    ).toEqual({ spettatori: "12", etichetta: "La chat di Alice" });
    expect(parseMeta(undefined, [])).toEqual({});
  });

  it("rejects unknown keys and unreadable text", () => {
    expect(() => parseMeta("spetatori=12", ["spettatori"])).toThrow(/sconosciuta «spetatori»/);
    expect(() => parseMeta("spettatori", ["spettatori"])).toThrow(BlockSyntaxError);
  });
});

describe("parseChat", () => {
  it("reads messages with and without time, system and grave lines", () => {
    expect(
      parseChat(
        "23:41 dannyboi_88: ma è vero sangue?\nm3tal_head: fake\n\n-- uscito\n!! Interrotta.",
      ),
    ).toEqual([
      { kind: "message", time: "23:41", user: "dannyboi_88", text: "ma è vero sangue?" },
      { kind: "message", time: undefined, user: "m3tal_head", text: "fake" },
      { kind: "system", text: "uscito", grave: false },
      { kind: "system", text: "Interrotta.", grave: true },
    ]);
  });

  it("rejects a line it cannot read, naming it", () => {
    expect(() => parseChat("23:41 nessun messaggio")).toThrow(/riga 1 .*«23:41 nessun messaggio»/);
  });

  it("rejects an empty chat", () => {
    expect(() => parseChat("\n\n")).toThrow(/vuota/);
  });

  it("validates the viewer count", () => {
    expect(parseChatOptions("spettatori=1204").viewers).toBe(1204);
    expect(() => parseChatOptions("spettatori=molti")).toThrow(/numero intero/);
  });
});

describe("parseLog", () => {
  it("marks error levels and glitches, keeping the text as written", () => {
    expect(parseLog("[06:12:04] INFO  avvio\n~ [06:12:11] ERR   corpo\n~~ ERROR di nuovo")).toEqual(
      [
        { text: "[06:12:04] INFO  avvio", error: false, glitch: "none" },
        { text: "[06:12:11] ERR   corpo", error: true, glitch: "static" },
        { text: "ERROR di nuovo", error: true, glitch: "live" },
      ],
    );
  });

  it("does not mistake words containing ERR for the level", () => {
    expect(parseLog("TERRA ferma")[0]?.error).toBe(false);
  });

  it("allows one live glitch per block (DS › RigheDiLog)", () => {
    expect(() => parseLog("~~ uno\n~~ due")).toThrow(/al massimo una volta/);
  });
});

describe("ctBlocks plugin", () => {
  it("turns a chat block into the DS ChatDiretta markup", () => {
    const body = render(fence("chat spettatori=1204", "23:41 alice.rec: <b>ciao</b>\n!! Fine."));
    const chat = getByRole(body, "log", { name: "Chat della diretta" });

    expect(chat.className).toBe("ct-chat");
    expect(chat.querySelector(".ct-chat__testa")?.textContent).toBe("In diretta1204 spettatori");
    expect(chat.querySelector(".ct-chat__utente")?.textContent).toBe("alice.rec:");
    // Text is escaped, never interpreted as HTML.
    expect(chat.querySelector(".ct-chat__msg")?.textContent).toBe("<b>ciao</b>");
    expect(chat.querySelector("b")).toBeNull();
    expect(chat.querySelector(".ct-chat__sistema--grave")?.textContent).toBe("Fine.");
    // The prose around the block is untouched.
    expect(body.querySelector("p")?.textContent).toBe("Prosa.");
  });

  it("turns a log block into the DS RigheDiLog markup", () => {
    const body = render(fence('log etichetta="Log del sistema"', "INFO ok\n~~ ERR corpo"));
    const log = getByRole(body, "log", { name: "Log del sistema" });
    const lines = log.querySelectorAll("span");

    expect(log.tagName).toBe("PRE");
    expect(lines).toHaveLength(2);
    expect(lines[1]?.className).toBe("ct-log__err ct-glitch ct-glitch--vivo");
  });

  it("leaves other code blocks alone", () => {
    const body = render(fence("js", "let a"));

    expect(body.querySelector("pre > code")?.textContent).toContain("let a");
    expect(getAllByRole(body, "paragraph")).toHaveLength(1);
  });

  it("stops the build naming the file and quoting the broken line", () => {
    const fileURL = pathToFileURL("/src/core/content/stories/senza-rimorso.md");

    expect(() =>
      markdownToHtml(fence("chat", "riga senza due punti"), { mdastPlugins: [ctBlocks], fileURL }),
    ).toThrow(/senza-rimorso\.md › blocco chat: riga 1 .*«riga senza due punti»/);
  });
});
