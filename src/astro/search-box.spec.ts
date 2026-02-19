import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, it } from "vitest";

// formatCounter is a pure function exported from search-box.ts, but importing
// the module at the top level fails in Node because search-box.ts defines
// `class SearchBox extends HTMLElement` — HTMLElement is a browser global.
// We set the JSDOM global before the dynamic import to satisfy that requirement.
let formatCounter: (total: number, query: string) => string;

beforeAll(async () => {
  const dom = new JSDOM("<!DOCTYPE html>");
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.customElements = dom.window.customElements;
  const module = await import("./search-box");
  formatCounter = module.formatCounter;
});

describe("formatCounter", () => {
  it("returns 'No results' message for 0 results", () => {
    expect(formatCounter(0, "foo")).toBe('No results for "foo"');
  });

  it("uses singular 'result' for 1 result", () => {
    expect(formatCounter(1, "bar")).toBe('1 result for "bar"');
  });

  it("uses plural 'results' for multiple results", () => {
    expect(formatCounter(2, "baz")).toBe('2 results for "baz"');
    expect(formatCounter(42, "hello world")).toBe(
      '42 results for "hello world"',
    );
  });
});
