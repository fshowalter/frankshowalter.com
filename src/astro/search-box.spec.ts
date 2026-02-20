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

describe("search-box", () => {
  describe("modal behavior", () => {
    let document: Document;
    let window: DOMWindow;
    let cleanup: () => void;
    let controller: SearchBoxController;

    beforeEach(async () => {
      // AIDEV-NOTE: vi.mock is called here (not at module top level) because Vitest
      // only hoists top-level vi.mock calls. initController uses a dynamic import()
      // which consults the mock registry at call time, so this order is correct.
      // Stubbing pagefind-api prevents openModal() from attempting a real pagefind
      // import that would fail in JSDOM and emit console.error noise.
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
      ({ cleanup, controller, document, window } = await createDom());
    });

    afterEach(() => {
      cleanup();
      vi.clearAllMocks();
      vi.unstubAllGlobals();
    });

    describe("initial render", () => {
      it("renders the search button", ({ expect }) => {
        const openBtn = document.querySelector("[data-open-search]");
        expect(openBtn).toBeTruthy();
      });

      it("renders the close button", ({ expect }) => {
        const closeBtn = document.querySelector("[data-close-search]");
        expect(closeBtn).toBeTruthy();
      });

      it("renders the dialog element", ({ expect }) => {
        const dialog = document.querySelector("dialog");
        expect(dialog).toBeTruthy();
      });

      it("enables the search button", ({ expect }) => {
        const openBtn =
          document.querySelector<HTMLButtonElement>("[data-open-search]");
        expect(openBtn?.disabled).toBe(false);
      });
    });

    describe("keyboard shortcut", () => {
      describe("on Mac", () => {
        beforeEach(async () => {
          controller.destroy();
          Object.defineProperty(window.navigator, "userAgent", {
            configurable: true,
            value:
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          });
          controller = await initController(
            document,
            window as unknown as Window,
          );
        });

        it("displays the ⌘K label", ({ expect }) => {
          const openBtn = document.querySelector("[data-open-search]");
          expect(openBtn?.getAttribute("aria-keyshortcuts")).toBe("Meta+K");
          expect(openBtn?.getAttribute("title")).toBe("Search: ⌘K");
        });

        describe("Cmd+K", () => {
          it("opens the modal", ({ expect }) => {
            const dialog = document.querySelector<HTMLDialogElement>("dialog");

            window.dispatchEvent(
              new window.KeyboardEvent("keydown", {
                bubbles: true,
                key: "k",
                metaKey: true,
              }),
            );

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(dialog?.showModal).toHaveBeenCalled();
          });

          describe("when modal is open", () => {
            it("closes the modal", ({ expect }) => {
              const openBtn =
                document.querySelector<HTMLButtonElement>("[data-open-search]");
              const dialog =
                document.querySelector<HTMLDialogElement>("dialog");

              openBtn?.click();
              expect(dialog?.open).toBe(true);

              window.dispatchEvent(
                new window.KeyboardEvent("keydown", {
                  bubbles: true,
                  key: "k",
                  metaKey: true,
                }),
              );

              // eslint-disable-next-line @typescript-eslint/unbound-method
              expect(dialog?.close).toHaveBeenCalled();
            });
          });
        });
      });

      describe("Ctrl+K", () => {
        it("opens the modal", ({ expect }) => {
          const dialog = document.querySelector<HTMLDialogElement>("dialog");

          window.dispatchEvent(
            new window.KeyboardEvent("keydown", {
              bubbles: true,
              ctrlKey: true,
              key: "k",
            }),
          );

          // eslint-disable-next-line @typescript-eslint/unbound-method
          expect(dialog?.showModal).toHaveBeenCalled();
        });
      });
    });

    describe("search button", () => {
      it("opens the modal", ({ expect }) => {
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
      let dialog: HTMLDialogElement | null;

      beforeEach(() => {
        const openBtn =
          document.querySelector<HTMLButtonElement>("[data-open-search]");
        dialog = document.querySelector<HTMLDialogElement>("dialog");
        openBtn?.click();
      });

      describe("close button", () => {
        it("closes the modal", ({ expect }) => {
          const closeBtn = document.querySelector<HTMLButtonElement>(
            "[data-close-search]",
          );

          expect(dialog?.open).toBe(true);

          closeBtn?.click();

          // eslint-disable-next-line @typescript-eslint/unbound-method
          expect(dialog?.close).toHaveBeenCalled();
        });
      });

      describe("click outside dialog", () => {
        it("closes the modal", async ({ expect }) => {
          expect(dialog?.open).toBe(true);

          // Wait for async operations to complete (openModal is async now)
          await new Promise((resolve) => setTimeout(resolve, 100));

          document.body.dispatchEvent(
            new window.MouseEvent("click", { bubbles: true, cancelable: true }),
          );

          // eslint-disable-next-line @typescript-eslint/unbound-method
          expect(dialog?.close).toHaveBeenCalled();
        });
      });

      describe("click inside dialog", () => {
        it("keeps the modal open", ({ expect }) => {
          const dialogFrame = document.querySelector("[data-dialog-frame]");

          expect(dialog?.open).toBe(true);

          dialogFrame?.dispatchEvent(
            new window.MouseEvent("click", { bubbles: true, cancelable: true }),
          );

          // eslint-disable-next-line @typescript-eslint/unbound-method
          expect(dialog?.close).not.toHaveBeenCalled();
          expect(dialog?.open).toBe(true);
        });
      });

      describe("link click", () => {
        it("closes the modal", async ({ expect }) => {
          expect(dialog?.open).toBe(true);

          // Wait for openModal's async SearchUI load so onClick is registered
          await new Promise((resolve) => setTimeout(resolve, 100));

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
    });

    describe("search input", () => {
      describe("Enter key", () => {
        it("blurs the input", async ({ expect }) => {
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

          input!.dispatchEvent(
            new window.KeyboardEvent("keydown", {
              bubbles: true,
              key: "Enter",
            }),
          );

          expect(blurSpy).toHaveBeenCalled();
        });
      });

      describe("clear button", () => {
        it("focuses the input", async ({ expect }) => {
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
      await vi.advanceTimersByTimeAsync(100);

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
      vi.useFakeTimers({ shouldAdvanceTime: true });

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

      vi.clearAllMocks();

      mockSearchAPI.search.mockResolvedValue({
        filters: {},
        results: [],
        timings: { preload: 0, search: 0, total: 0 },
        totalFilters: {},
        unfilteredResultCount: 0,
      });

      ({ cleanup, document, window } = await createDom());

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
      it("displays results", async ({ expect }) => {
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

        await openSearchAndWaitForInit(queries);

        typeInSearchInput(queries, "test");

        await vi.advanceTimersByTimeAsync(150);

        await waitFor(() => {
          const results = queries.getByRole("region", {
            name: /search results/i,
          });
          expect(results.textContent).toContain("Test Title 1");
          expect(results.textContent).toContain("Test excerpt 1");
        });

        const counter = document.querySelector("#search-box-counter");
        expect(counter?.textContent).toContain("2 results");
      });

      it("shows loading state", async ({ expect }) => {
        const queries = within(document.body);
        let resolveSearch: (value: PagefindSearchResults) => void;
        const searchPromise = new Promise<PagefindSearchResults>((resolve) => {
          resolveSearch = resolve;
        });

        mockSearchAPI.search.mockReturnValueOnce(searchPromise);

        await openSearchAndWaitForInit(queries);

        typeInSearchInput(queries, "test");

        await vi.advanceTimersByTimeAsync(150);

        const results = queries.getByRole("region", {
          name: /search results/i,
        });
        expect(results.innerHTML).toContain("animate-pulse");

        resolveSearch!({
          filters: {},
          results: [],
          timings: { preload: 0, search: 0, total: 0 },
          totalFilters: {},
          unfilteredResultCount: 0,
        });

        await vi.advanceTimersByTimeAsync(100);

        expect(results.innerHTML).not.toContain("animate-pulse");
      });

      it("discards stale results", async ({ expect }) => {
        const queries = within(document.body);

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
        await vi.advanceTimersByTimeAsync(10);

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
        await vi.advanceTimersByTimeAsync(10);

        await waitFor(() => {
          const resultsDiv = document.querySelector("#search-box-results");
          expect(resultsDiv?.textContent).toContain("Fresh Result");
          expect(resultsDiv?.textContent).not.toContain("Stale Result");
        });
      });

      describe("when no results found", () => {
        it("shows a no-results message", async ({ expect }) => {
          const queries = within(document.body);
          mockSearchAPI.search.mockResolvedValueOnce({
            filters: {},
            results: [],
            timings: { preload: 0, search: 0, total: 0 },
            totalFilters: {},
            unfilteredResultCount: 0,
          });

          await openSearchAndWaitForInit(queries);

          typeInSearchInput(queries, "notfound");

          await vi.advanceTimersByTimeAsync(150);

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
      });
    });

    describe("clear button", () => {
      describe("when input has text", () => {
        it("is visible", async ({ expect }) => {
          const queries = within(document.body);
          await openSearchAndWaitForInit(queries);

          const clearButton = queries.getByRole("button", { name: /clear/i });
          expect(clearButton.classList.contains("hidden")).toBe(true);

          typeInSearchInput(queries, "test");

          await vi.advanceTimersByTimeAsync(150);

          expect(clearButton.classList.contains("hidden")).toBe(false);
        });
      });

      describe("when input is empty", () => {
        it("is hidden", async ({ expect }) => {
          const queries = within(document.body);
          await openSearchAndWaitForInit(queries);

          const clearButton = queries.getByRole("button", { name: /clear/i });
          const searchInput = queries.getByRole<HTMLInputElement>("searchbox");

          typeInSearchInput(queries, "test");
          await vi.advanceTimersByTimeAsync(150);
          expect(clearButton.classList.contains("hidden")).toBe(false);

          searchInput.value = "";
          searchInput.dispatchEvent(
            new window.Event("input", { bubbles: true }),
          );
          await vi.advanceTimersByTimeAsync(150);

          expect(clearButton.classList.contains("hidden")).toBe(true);
        });
      });

      describe("when clicked", () => {
        it("clears the search", async ({ expect }) => {
          const queries = within(document.body);
          await openSearchAndWaitForInit(queries);

          const searchInput = queries.getByRole<HTMLInputElement>("searchbox");
          typeInSearchInput(queries, "test");

          await vi.advanceTimersByTimeAsync(150);

          const clearButton = queries.getByRole("button", { name: /clear/i });
          expect(clearButton.classList.contains("hidden")).toBe(false);

          clearButton.click();

          expect(searchInput.value).toBe("");
          expect(clearButton.classList.contains("hidden")).toBe(true);

          const resultsDiv = document.querySelector("#search-box-results");
          expect(resultsDiv?.innerHTML).toBe("");
        });
      });
    });

    describe("when input is cleared", () => {
      it("removes results", async ({ expect }) => {
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

        await openSearchAndWaitForInit(queries);

        const searchInput = queries.getByRole<HTMLInputElement>("searchbox");
        typeInSearchInput(queries, "test");
        await vi.advanceTimersByTimeAsync(150);

        await waitFor(() => {
          const results = queries.getByRole("region", {
            name: /search results/i,
          });
          expect(results.textContent).toContain("Test Title");
          const counter = document.querySelector("#search-box-counter");
          expect(counter?.textContent).toBe('1 result for "test"');
        });

        searchInput.value = "";
        searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));

        await vi.advanceTimersByTimeAsync(150);

        const resultsDiv = document.querySelector("#search-box-results");
        expect(resultsDiv?.innerHTML).toBe("");

        const counter = document.querySelector("#search-box-counter");
        expect(counter?.textContent).toBe("");
      });
    });

    describe("load more button", () => {
      it("loads additional results", async ({ expect }) => {
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

        await openSearchAndWaitForInit(queries);

        typeInSearchInput(queries, "test");
        await vi.advanceTimersByTimeAsync(150);

        await waitFor(() => {
          const results = queries.getByRole("region", {
            name: /search results/i,
          });
          expect(results.textContent).toContain("Result 1");
          expect(results.textContent).toContain("Result 5");
          expect(results.textContent).toContain("Result 10");
          expect(results.textContent).not.toContain("Result 11");
        });

        const loadMoreButton = queries.getByRole("button", {
          name: /load.*more/i,
        });
        expect(loadMoreButton.textContent).toContain("Load 10 more");

        await user.click(loadMoreButton);

        await vi.advanceTimersByTimeAsync(10);

        await waitFor(() => {
          const results = queries.getByRole("region", {
            name: /search results/i,
          });
          expect(results.textContent).toContain("Result 11");
          expect(results.textContent).toContain("Result 20");
        });

        await waitFor(() => {
          expect(
            loadMoreButton.parentElement?.classList.contains("hidden"),
          ).toBe(true);
        });
      });
    });
  });
});
