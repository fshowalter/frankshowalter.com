import { describe, expect, it } from "vitest";

import { formatCounter } from "./search-ui";

describe("formatCounter", () => {
  it("returns 'No results' message for 0 results", () => {
    expect(formatCounter(0, "foo")).toBe('No results for "foo"');
  });

  it("uses singular 'result' for 1 result", () => {
    expect(formatCounter(1, "bar")).toBe('1 result for "bar"');
  });

  it("uses plural 'results' for multiple results", () => {
    expect(formatCounter(2, "baz")).toBe('2 results for "baz"');
    expect(formatCounter(42, "hello world")).toBe('42 results for "hello world"');
  });
});
