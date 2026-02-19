import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { DOMWindow } from "jsdom";
import type { Mocked } from "vitest";

import { getContainerRenderer as reactContainerRenderer } from "@astrojs/react";
import { waitFor, within } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, it, vi } from "vitest";

import type { PagefindAPI, PagefindSearchResults } from "./pagefind-api";
import type { SearchBoxController } from "./search-box.ts";

// Create mock search API that will be injected into SearchBox
const mockSearchAPI = {
  destroy: vi.fn(() => Promise.resolve()),
  init: vi.fn(() => Promise.resolve()),
  search: vi.fn(),
} as unknown as Mocked<PagefindAPI>;

// AIDEV-NOTE: createDom() is the shared async setup for both describe blocks.
// It handles: Astro render → JSDOM → globalThis test-utility assignments →
// dialog mocks → vi.stubGlobal → vi.resetModules → initController → cleanup fn.
// The only differences between the two beforeEach blocks are fake timers,
// mock injection, and userEvent init — everything else lives here.
async function createDom(): Promise<{
  cleanup: () => void;
  controller: SearchBoxController;
  document: Document;
  window: DOMWindow;
}> {
  // Render the test page using Astro's container API
  const renderers = await loadRenderers([reactContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });

  const TestPageModule =
    (await import("./fixtures/search-box-fixture.astro")) as {
      default: AstroComponentFactory;
    };
  const TestPage = TestPageModule.default;

  const result = await container.renderToString(TestPage, {
    partial: false,
    request: new Request(`https://www.franksmovielog.com/test`),
  });

  // Create JSDOM instance with the rendered HTML
  const dom = new JSDOM(result, {
    pretendToBeVisual: true,
    runScripts: "dangerously",
    url: "https://www.franksmovielog.com/test",
  });

  const document = dom.window.document;
  const window = dom.window;

  // globalThis.window is needed by @testing-library/user-event's clipboard
  // cleanup (afterEach/afterAll registered at module import time).
  // globalThis.document is needed by @testing-library/dom's waitFor.
  // globalThis.requestAnimationFrame is needed by userEvent internals.
  // These are test-utility requirements, not search-box.ts requirements.
  globalThis.window = window as unknown as typeof globalThis & Window;
  globalThis.document = document;
  globalThis.requestAnimationFrame = window.requestAnimationFrame;

  vi.stubGlobal("import.meta.env", { BASE_URL: "/" });

  // Mock dialog methods
  const dialog = document.querySelector("dialog") as HTMLDialogElement;
  if (dialog) {
    dialog.showModal = vi.fn().mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = true;
    });
    dialog.close = vi.fn().mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = false;
      this.dispatchEvent(new window.Event("close"));
    });
  }

  // Reset modules to get a fresh search-box.ts instance each test
  vi.resetModules();

  const controller = await initController(
    document,
    window as unknown as Window,
  );

  const cleanup = () => {
    const d = document.querySelector("dialog");
    if (d) {
      d.open = false;
    }
    window.close();
  };

  return { cleanup, controller, document, window };
}

// Helper: instantiate SearchBoxController directly, bypassing the web component shell.
// Uses a dynamic import so vi.mock("./pagefind-api") — called inside beforeEach — is
// already registered before search-box.ts imports it.
async function initController(
  document: Document,
  win: Window,
): Promise<SearchBoxController> {
  const { SearchBoxController } = await import("./search-box.ts");
  const root = document.querySelector("search-box")!;
  const controller = new SearchBoxController(root, win);
  controller.init();
  return controller;
}

describe("search modal", () => {
  let document: Document;
  let window: DOMWindow;
  let cleanup: () => void;
  let controller: SearchBoxController;

  beforeEach(async () => {
    ({ cleanup, controller, document, window } = await createDom());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  describe("on initial render", () => {
    it("renders search button", ({ expect }) => {
      const openBtn = document.querySelector("[data-open-search]");
      expect(openBtn).toBeTruthy();
    });

    it("renders close button", ({ expect }) => {
      const closeBtn = document.querySelector("[data-close-search]");
      expect(closeBtn).toBeTruthy();
    });

    it("renders dialog element", ({ expect }) => {
      const dialog = document.querySelector("dialog");
      expect(dialog).toBeTruthy();
    });

    it("enables search button after initialization", ({ expect }) => {
      const openBtn =
        document.querySelector<HTMLButtonElement>("[data-open-search]");
      expect(openBtn?.disabled).toBe(false);
    });
  });

  describe("on Mac", () => {
    beforeEach(async () => {
      controller.destroy();
      Object.defineProperty(window.navigator, "userAgent", {
        configurable: true,
        value:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      });
      controller = await initController(document, window as unknown as Window);
    });

    it("sets Mac keyboard shortcut", ({ expect }) => {
      const openBtn = document.querySelector("[data-open-search]");
      expect(openBtn?.getAttribute("aria-keyshortcuts")).toBe("Meta+K");
      expect(openBtn?.getAttribute("title")).toBe("Search: ⌘K");
    });
  });

  describe("when search button is clicked", () => {
    it("opens modal", ({ expect }) => {
      const openBtn =
        document.querySelector<HTMLButtonElement>("[data-open-search]");
      const dialog = document.querySelector<HTMLDialogElement>("dialog");

      openBtn?.click();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(dialog?.showModal).toHaveBeenCalled();
      expect(dialog?.open).toBe(true);
    });
  });

  describe("when modal is open", () => {
    let openBtn: HTMLButtonElement | null;
    let dialog: HTMLDialogElement | null;

    beforeEach(() => {
      openBtn = document.querySelector<HTMLButtonElement>("[data-open-search]");
      dialog = document.querySelector<HTMLDialogElement>("dialog");
      // Open the modal
      openBtn?.click();
    });

    it("closes when close button is clicked", ({ expect }) => {
      const closeBtn = document.querySelector<HTMLButtonElement>(
        "[data-close-search]",
      );

      expect(dialog?.open).toBe(true);

      // Then close it
      closeBtn?.click();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(dialog?.close).toHaveBeenCalled();
    });

    it("closes when clicking outside dialog frame", async ({ expect }) => {
      expect(dialog?.open).toBe(true);

      // Wait for async operations to complete (openModal is async now)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Click outside the dialog frame (on body)
      const clickEvent = new window.MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      document.body.dispatchEvent(clickEvent);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(dialog?.close).toHaveBeenCalled();
    });

    it("does not close when clicking inside dialog frame", ({ expect }) => {
      const dialogFrame = document.querySelector("[data-dialog-frame]");

      expect(dialog?.open).toBe(true);

      // Click inside the dialog frame
      const clickEvent = new window.MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      dialogFrame?.dispatchEvent(clickEvent);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(dialog?.close).not.toHaveBeenCalled();
      expect(dialog?.open).toBe(true);
    });

    it("closes when clicking on a link", async ({ expect }) => {
      expect(dialog?.open).toBe(true);

      // Wait for openModal's async SearchUI load so onClick is registered
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create and click a link
      const link = document.createElement("a");
      link.href = "/test";
      document.body.append(link);

      const clickEvent = new window.MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, "target", {
        value: link,
        writable: false,
      });
      window.dispatchEvent(clickEvent);

      // Wait for the 100ms delay before modal closes
      await new Promise((resolve) => setTimeout(resolve, 110));

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(dialog?.close).toHaveBeenCalled();
    });
  });

  describe("when Cmd+K is pressed", () => {
    it("opens modal", ({ expect }) => {
      const dialog = document.querySelector<HTMLDialogElement>("dialog");

      const keyEvent = new window.KeyboardEvent("keydown", {
        bubbles: true,
        key: "k",
        metaKey: true,
      });
      window.dispatchEvent(keyEvent);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(dialog?.showModal).toHaveBeenCalled();
    });

    it("closes modal when already open", ({ expect }) => {
      const openBtn =
        document.querySelector<HTMLButtonElement>("[data-open-search]");
      const dialog = document.querySelector<HTMLDialogElement>("dialog");

      // Open the modal first
      openBtn?.click();
      expect(dialog?.open).toBe(true);

      // Press Cmd+K to close
      const keyEvent = new window.KeyboardEvent("keydown", {
        bubbles: true,
        key: "k",
        metaKey: true,
      });
      window.dispatchEvent(keyEvent);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(dialog?.close).toHaveBeenCalled();
    });
  });

  describe("when Ctrl+K is pressed", () => {
    it("opens modal", ({ expect }) => {
      const dialog = document.querySelector<HTMLDialogElement>("dialog");

      const keyEvent = new window.KeyboardEvent("keydown", {
        bubbles: true,
        ctrlKey: true,
        key: "k",
      });
      window.dispatchEvent(keyEvent);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(dialog?.showModal).toHaveBeenCalled();
    });
  });

  describe("when Enter is pressed in search input", () => {
    it("blurs search input", async ({ expect }) => {
      // Open modal first so SearchUI initializes and registers the keydown listener
      const openBtn =
        document.querySelector<HTMLButtonElement>("[data-open-search]");
      openBtn?.click();

      // Wait for SearchUI lazy-load and init to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const input =
        document.querySelector<HTMLInputElement>("#search-box-input");
      expect(input).toBeTruthy();

      const blurSpy = vi.spyOn(input!, "blur");
      input!.focus();

      // Dispatch directly on the input element (handler is registered there by SearchUI)
      input!.dispatchEvent(
        new window.KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
      );

      expect(blurSpy).toHaveBeenCalled();
    });
  });

  describe("when clear button is clicked", () => {
    it("focuses search input", async ({ expect }) => {
      // Open modal first so SearchUI initializes and registers the click listener
      const openBtn =
        document.querySelector<HTMLButtonElement>("[data-open-search]");
      openBtn?.click();

      // Wait for SearchUI lazy-load and init to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const clearBtn =
        document.querySelector<HTMLButtonElement>("#search-box-clear");
      const searchInput =
        document.querySelector<HTMLInputElement>("#search-box-input");

      expect(clearBtn).toBeTruthy();
      expect(searchInput).toBeTruthy();

      const focusSpy = vi.spyOn(searchInput!, "focus");

      // Click the clear button directly (SearchUI's handler calls input.focus() and
      // stopPropagation() so the modal's onClick handler is never reached)
      clearBtn!.click();

      expect(focusSpy).toHaveBeenCalled();
    });
  });
});

describe("search functionality", () => {
  let document: Document;
  let window: DOMWindow;
  let cleanup: () => void;
  let user: ReturnType<typeof userEvent.setup>;

  // Helper function to open search and wait for initialization
  const openSearchAndWaitForInit = async (queries: {
    getByRole: (
      role: string,
      options?: { name: RegExp | string },
    ) => HTMLElement;
  }) => {
    const searchButton = queries.getByRole("button", { name: /search/i });
    await user.click(searchButton);

    // Wait for modal to open and SearchUI to initialize
    await vi.runOnlyPendingTimersAsync();
    await new Promise((resolve) => setTimeout(resolve, 100));
    await vi.runOnlyPendingTimersAsync();

    // Verify modal is open
    const dialog = document.querySelector("dialog");
    if (!dialog?.open) {
      throw new Error("Search modal did not open");
    }
  };

  // Helper to type in search input
  const typeInSearchInput = (
    queries: { getByRole: (role: string) => HTMLElement },
    value: string,
  ) => {
    const searchInput = queries.getByRole("searchbox") as HTMLInputElement;
    searchInput.value = value;
    searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  };

  beforeEach(async () => {
    // Use fake timers
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Re-setup mocks after reset — inject mockSearchAPI so SearchBox uses it.
    // AIDEV-NOTE: vi.mock is called here (not at module top level) because Vitest
    // only hoists top-level vi.mock calls. initController uses a dynamic import()
    // which consults the mock registry at call time, so this order is correct.
    vi.mock("./pagefind-api", async () => {
      const actual =
        await vi.importActual<typeof import("./pagefind-api")>(
          "./pagefind-api",
        );
      return {
        ...actual,
        PagefindAPI: vi.fn().mockImplementation(() => mockSearchAPI),
      };
    });

    // Reset mock functions
    vi.clearAllMocks();

    // Set up default mock return values for search
    mockSearchAPI.search.mockResolvedValue({
      filters: {},
      results: [],
      timings: { preload: 0, search: 0, total: 0 },
      totalFilters: {},
      unfilteredResultCount: 0,
    });

    ({ cleanup, document, window } = await createDom());

    // Initialize user with fake timers AFTER DOM is set up
    user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
      document,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("when searching", () => {
    it("displays results when user types a search query", async ({
      expect,
    }) => {
      const queries = within(document.body);
      const mockResults = [
        {
          data: vi.fn().mockResolvedValue({
            excerpt: "Test excerpt 1",
            filters: {},
            meta: { title: "Test Title 1" },
            url: "https://www.franksmovielog.com/test1",
            weighted_locations: [],
          }),
          id: "1",
          score: 1,
          words: [1],
        },
        {
          data: vi.fn().mockResolvedValue({
            excerpt: "Test excerpt 2",
            filters: {},
            meta: { title: "Test Title 2" },
            url: "https://www.franksmovielog.com/test2",
            weighted_locations: [],
          }),
          id: "2",
          score: 0.9,
          words: [1],
        },
      ];

      mockSearchAPI.search.mockResolvedValueOnce({
        filters: {},
        results: mockResults,
        timings: { preload: 0, search: 0, total: 0 },
        totalFilters: {},
        unfilteredResultCount: 2,
      });

      // Open search modal and wait for initialization
      await openSearchAndWaitForInit(queries);

      // User types in the search box
      typeInSearchInput(queries, "test");

      // Advance timers to trigger debounced search
      await vi.advanceTimersByTimeAsync(150);

      // Wait for results to render
      await waitFor(() => {
        const results = queries.getByRole("region", {
          name: /search results/i,
        });
        expect(results.textContent).toContain("Test Title 1");
        expect(results.textContent).toContain("Test excerpt 1");
      });

      // Check counter
      const counter = document.querySelector("#search-box-counter");
      expect(counter?.textContent).toContain("2 results");
    });

    it("shows no results message when search returns empty", async ({
      expect,
    }) => {
      const queries = within(document.body);
      mockSearchAPI.search.mockResolvedValueOnce({
        filters: {},
        results: [],
        timings: { preload: 0, search: 0, total: 0 },
        totalFilters: {},
        unfilteredResultCount: 0,
      });

      // Open search modal and wait for initialization
      await openSearchAndWaitForInit(queries);

      // Type search query
      typeInSearchInput(queries, "notfound");

      // Wait for debounce
      await vi.advanceTimersByTimeAsync(150);

      // Check for no results message
      await waitFor(() => {
        const counter = document.querySelector("#search-box-counter");
        expect(counter?.textContent).toBe('No results for "notfound"');

        const results = queries.getByRole("region", {
          name: /search results/i,
        });
        expect(results.textContent).toContain(
          "No results found. Try adjusting your search terms.",
        );
      });
    });

    it("shows loading state while searching", async ({ expect }) => {
      const queries = within(document.body);
      let resolveSearch: (value: PagefindSearchResults) => void;
      const searchPromise = new Promise<PagefindSearchResults>((resolve) => {
        resolveSearch = resolve;
      });

      mockSearchAPI.search.mockReturnValueOnce(searchPromise);

      // Open search modal and wait for initialization
      await openSearchAndWaitForInit(queries);

      // Type search query
      typeInSearchInput(queries, "test");

      // Advance past debounce to trigger search
      await vi.advanceTimersByTimeAsync(150);

      // Check for loading state
      const results = queries.getByRole("region", {
        name: /search results/i,
      });
      expect(results.innerHTML).toContain("animate-pulse");

      // Resolve search
      resolveSearch!({
        filters: {},
        results: [],
        timings: { preload: 0, search: 0, total: 0 },
        totalFilters: {},
        unfilteredResultCount: 0,
      });

      await vi.advanceTimersByTimeAsync(100);

      // Loading state should be gone
      expect(results.innerHTML).not.toContain("animate-pulse");
    });

    it("clears results when user clears the input", async ({ expect }) => {
      const queries = within(document.body);
      const mockResults = [
        {
          data: vi.fn().mockResolvedValue({
            excerpt: "Test excerpt",
            filters: {},
            meta: { title: "Test Title" },
            url: "https://www.franksmovielog.com/test",
            weighted_locations: [],
          }),
          id: "1",
          score: 1,
          words: [1],
        },
      ];

      mockSearchAPI.search.mockResolvedValueOnce({
        filters: {},
        results: mockResults,
        timings: { preload: 0, search: 0, total: 0 },
        totalFilters: {},
        unfilteredResultCount: 1,
      });

      // Open search modal and wait for initialization
      await openSearchAndWaitForInit(queries);

      // Type search query
      const searchInput = queries.getByRole<HTMLInputElement>("searchbox");
      typeInSearchInput(queries, "test");
      await vi.advanceTimersByTimeAsync(150);

      // Verify results are shown and counter shows singular form
      await waitFor(() => {
        const results = queries.getByRole("region", {
          name: /search results/i,
        });
        expect(results.textContent).toContain("Test Title");
        const counter = document.querySelector("#search-box-counter");
        expect(counter?.textContent).toBe('1 result for "test"');
      });

      // Clear the input
      searchInput.value = "";
      searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));

      // Wait for debounce to process clear
      await vi.advanceTimersByTimeAsync(150);

      // Results should be cleared
      const resultsDiv = document.querySelector("#search-box-results");
      expect(resultsDiv?.innerHTML).toBe("");

      const counter = document.querySelector("#search-box-counter");
      expect(counter?.textContent).toBe("");
    });

    it("shows and hides clear button based on input", async ({ expect }) => {
      const queries = within(document.body);
      // Open search modal and wait for initialization
      await openSearchAndWaitForInit(queries);

      const clearButton = queries.getByRole("button", { name: /clear/i });
      const searchInput = queries.getByRole<HTMLInputElement>("searchbox");

      // Initially hidden
      expect(clearButton.classList.contains("hidden")).toBe(true);

      // Type in input
      typeInSearchInput(queries, "test");

      // Wait for debounce to update clear button
      await vi.advanceTimersByTimeAsync(150);

      // Clear button should be visible
      expect(clearButton.classList.contains("hidden")).toBe(false);

      // Clear input
      searchInput.value = "";
      searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));

      // Wait for debounce to update clear button
      await vi.advanceTimersByTimeAsync(150);

      // Clear button should be hidden again
      expect(clearButton.classList.contains("hidden")).toBe(true);
    });

    it("clears search when user clicks clear button", async ({ expect }) => {
      const queries = within(document.body);
      // Open search modal and wait for initialization
      await openSearchAndWaitForInit(queries);

      // Type search query
      const searchInput = queries.getByRole<HTMLInputElement>("searchbox");
      typeInSearchInput(queries, "test");

      // Wait for debounce to show clear button
      await vi.advanceTimersByTimeAsync(150);

      const clearButton = queries.getByRole("button", { name: /clear/i });
      expect(clearButton.classList.contains("hidden")).toBe(false);

      // Click clear button
      clearButton.click();

      // Input should be cleared
      expect(searchInput.value).toBe("");
      expect(clearButton.classList.contains("hidden")).toBe(true);

      const resultsDiv = document.querySelector("#search-box-results");
      expect(resultsDiv?.innerHTML).toBe("");
    });

    it("discards results from a stale search when a newer search resolves", async ({
      expect,
    }) => {
      const queries = within(document.body);

      // Deferred promises so we control resolution order
      let resolveSearch1!: (value: PagefindSearchResults) => void;
      let resolveSearch2!: (value: PagefindSearchResults) => void;
      const search1Promise = new Promise<PagefindSearchResults>((resolve) => {
        resolveSearch1 = resolve;
      });
      const search2Promise = new Promise<PagefindSearchResults>((resolve) => {
        resolveSearch2 = resolve;
      });

      mockSearchAPI.search
        .mockReturnValueOnce(search1Promise)
        .mockReturnValueOnce(search2Promise);

      await openSearchAndWaitForInit(queries);

      // Trigger search 1 ("stale")
      typeInSearchInput(queries, "stale");
      await vi.advanceTimersByTimeAsync(150);

      // Trigger search 2 ("fresh") — increments generation counter
      typeInSearchInput(queries, "fresh");
      await vi.advanceTimersByTimeAsync(150);

      // Resolve search 2 first so its results are applied
      resolveSearch2({
        filters: {},
        results: [
          {
            data: vi.fn().mockResolvedValue({
              excerpt: "Fresh excerpt",
              filters: {},
              meta: { title: "Fresh Result" },
              url: "https://www.franksmovielog.com/fresh",
              weighted_locations: [],
            }),
            id: "fresh",
            score: 1,
            words: [],
          },
        ],
        timings: { preload: 0, search: 0, total: 0 },
        totalFilters: {},
        unfilteredResultCount: 1,
      });
      await vi.runOnlyPendingTimersAsync();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Now resolve search 1 — it should be discarded (generation mismatch)
      resolveSearch1({
        filters: {},
        results: [
          {
            data: vi.fn().mockResolvedValue({
              excerpt: "Stale excerpt",
              filters: {},
              meta: { title: "Stale Result" },
              url: "https://www.franksmovielog.com/stale",
              weighted_locations: [],
            }),
            id: "stale",
            score: 1,
            words: [],
          },
        ],
        timings: { preload: 0, search: 0, total: 0 },
        totalFilters: {},
        unfilteredResultCount: 1,
      });
      await vi.runOnlyPendingTimersAsync();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Only the fresh (search 2) results should be visible
      await waitFor(() => {
        const resultsDiv = document.querySelector("#search-box-results");
        expect(resultsDiv?.textContent).toContain("Fresh Result");
        expect(resultsDiv?.textContent).not.toContain("Stale Result");
      });
    });
  });

  describe("when loading more results", () => {
    it("loads more results when user clicks load more button", async ({
      expect,
    }) => {
      const queries = within(document.body);
      const createMockResult = (id: string) => ({
        data: vi.fn().mockResolvedValue({
          excerpt: `Excerpt ${id}`,
          filters: {},
          meta: { title: `Result ${id}` },
          url: `https://www.franksmovielog.com/result${id}`,
          weighted_locations: [],
        }),
        id,
        score: 1,
        words: [1],
      });

      const mockResults = Array.from({ length: 20 }, (_, i) =>
        createMockResult(`${i + 1}`),
      );

      mockSearchAPI.search.mockResolvedValueOnce({
        filters: {},
        results: mockResults,
        timings: { preload: 0, search: 0, total: 0 },
        totalFilters: {},
        unfilteredResultCount: 10,
      });

      // Open search modal and wait for initialization
      await openSearchAndWaitForInit(queries);

      // Type search query
      typeInSearchInput(queries, "test");
      await vi.advanceTimersByTimeAsync(150);

      // Wait for initial results
      await waitFor(() => {
        const results = queries.getByRole("region", {
          name: /search results/i,
        });
        expect(results.textContent).toContain("Result 1");
        expect(results.textContent).toContain("Result 5");
        expect(results.textContent).toContain("Result 10");
        expect(results.textContent).not.toContain("Result 11");
      });

      // Click load more
      const loadMoreButton = queries.getByRole("button", {
        name: /load.*more/i,
      });
      expect(loadMoreButton.textContent).toContain("Load 10 more");

      await user.click(loadMoreButton);

      // Wait for all async operations to complete
      // The renderResults function has 5 await calls for result.data()
      await vi.runOnlyPendingTimersAsync();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Wait for additional results to be rendered
      await waitFor(() => {
        const results = queries.getByRole("region", {
          name: /search results/i,
        });
        expect(results.textContent).toContain("Result 11");
        expect(results.textContent).toContain("Result 20");
      });

      // Load more button should be hidden after loading all results
      await waitFor(() => {
        expect(loadMoreButton.parentElement?.classList.contains("hidden")).toBe(
          true,
        );
      });
    });
  });
});
