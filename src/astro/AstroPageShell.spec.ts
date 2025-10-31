import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { DOMWindow, JSDOM as JSDOMType } from "jsdom";
import type { Mocked } from "vitest";

import { getContainerRenderer as reactContainerRenderer } from "@astrojs/react";
import { waitFor, within } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, it, vi } from "vitest";

import type { SearchAPI } from "./search-ui";
import type { PagefindSearchResults } from "./search-ui";

// Create mock search API that will be injected into SearchUI
const mockSearchAPI = {
  destroy: vi.fn(() => Promise.resolve()),
  init: vi.fn(() => Promise.resolve()),
  search: vi.fn(),
} as unknown as Mocked<SearchAPI>;

describe("AstroPageShell", () => {
  describe("search modal", () => {
    let dom: JSDOMType;
    let document: Document;
    let window: DOMWindow;
    let cleanup: () => void;

    beforeEach(async () => {
      // Render the test page using Astro's container API
      const renderers = await loadRenderers([reactContainerRenderer()]);
      const container = await AstroContainer.create({ renderers });

      // Import our test page that uses the AstroPageShell
      const TestPageModule = (await import("./TestPage.astro")) as {
        default: AstroComponentFactory;
      };
      const TestPage = TestPageModule.default;

      const result = await container.renderToString(TestPage, {
        partial: false,
        request: new Request(`https://www.franksmovielog.com/test`),
      });

      // Create JSDOM instance with the rendered HTML
      dom = new JSDOM(result, {
        pretendToBeVisual: true,
        runScripts: "dangerously",
        url: "https://www.franksmovielog.com/test",
      });

      document = dom.window.document;
      window = dom.window;

      // Make JSDOM's window and document available globally
      globalThis.window = window as unknown as typeof globalThis & Window;
      globalThis.document = document;
      Object.defineProperty(globalThis, "navigator", {
        configurable: true,
        value: window.navigator,
        writable: true,
      });

      // Set up mocks
      globalThis.requestAnimationFrame = window.requestAnimationFrame;
      globalThis.requestIdleCallback =
        window.requestIdleCallback ||
        ((cb: IdleRequestCallback) => setTimeout(cb, 1));

      // Set up globalThis event listeners
      globalThis.addEventListener = window.addEventListener.bind(window);
      globalThis.removeEventListener = window.removeEventListener.bind(window);
      globalThis.dispatchEvent = window.dispatchEvent.bind(window);

      // Add HTMLInputElement to global scope for customSearch
      globalThis.HTMLInputElement = window.HTMLInputElement;
      globalThis.HTMLButtonElement = window.HTMLButtonElement;

      vi.stubGlobal("import.meta.env", {
        BASE_URL: "/",
      });

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

      // Import and initialize pageFind
      const { initPageFind } = await import("./search.ts");
      initPageFind();

      cleanup = () => {
        delete document.body.dataset.searchModalOpen;
        const dialog = document.querySelector("dialog");
        if (dialog) {
          dialog.open = false;
        }
      };
    });

    afterEach(() => {
      cleanup();
      window.close();
      vi.clearAllMocks();
    });

    describe("on initial render", () => {
      it("renders search button", ({ expect }) => {
        const openBtn = document.querySelector("[data-open-modal]");
        expect(openBtn).toBeTruthy();
      });

      it("renders close button", ({ expect }) => {
        const closeBtn = document.querySelector("[data-close-modal]");
        expect(closeBtn).toBeTruthy();
      });

      it("renders dialog element", ({ expect }) => {
        const dialog = document.querySelector("dialog");
        expect(dialog).toBeTruthy();
      });

      it("enables search button after initialization", ({ expect }) => {
        const openBtn =
          document.querySelector<HTMLButtonElement>("[data-open-modal]");
        expect(openBtn?.disabled).toBe(false);
      });
    });

    describe("on Mac", () => {
      it("sets Mac keyboard shortcut", async ({ expect }) => {
        // Re-initialize with Mac user agent
        const originalUserAgent = Object.getOwnPropertyDescriptor(
          window.navigator,
          "userAgent",
        );
        Object.defineProperty(window.navigator, "userAgent", {
          configurable: true,
          value:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        });

        // Re-import and initialize
        vi.resetModules();
        const { initPageFind } = await import("./search.ts");
        initPageFind();

        const openBtn = document.querySelector("[data-open-modal]");
        expect(openBtn?.getAttribute("aria-keyshortcuts")).toBe("Meta+K");
        expect(openBtn?.getAttribute("title")).toBe("Search: ⌘K");

        // Restore original user agent
        if (originalUserAgent) {
          Object.defineProperty(
            window.navigator,
            "userAgent",
            originalUserAgent,
          );
        }
      });
    });

    describe("when search button is clicked", () => {
      it("opens modal", ({ expect }) => {
        const openBtn =
          document.querySelector<HTMLButtonElement>("[data-open-modal]");
        const dialog = document.querySelector<HTMLDialogElement>("dialog");

        openBtn?.click();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(dialog?.showModal).toHaveBeenCalled();
        expect(Object.hasOwn(document.body.dataset, "searchModalOpen")).toBe(
          true,
        );
      });
    });

    describe("when modal is open", () => {
      let openBtn: HTMLButtonElement | null;
      let dialog: HTMLDialogElement | null;

      beforeEach(() => {
        openBtn =
          document.querySelector<HTMLButtonElement>("[data-open-modal]");
        dialog = document.querySelector<HTMLDialogElement>("dialog");
        // Open the modal
        openBtn?.click();
      });

      it("closes when close button is clicked", ({ expect }) => {
        const closeBtn =
          document.querySelector<HTMLButtonElement>("[data-close-modal]");

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
        globalThis.dispatchEvent(clickEvent);

        // Wait for the 100ms delay before modal closes
        await new Promise((resolve) => setTimeout(resolve, 110));

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(dialog?.close).toHaveBeenCalled();
      });

      it("removes data-search-modal-open attribute when dialog closes", ({
        expect,
      }) => {
        expect(Object.hasOwn(document.body.dataset, "searchModalOpen")).toBe(
          true,
        );

        // Trigger the close event (the mock close() already dispatches it)
        dialog?.close();

        expect(Object.hasOwn(document.body.dataset, "searchModalOpen")).toBe(
          false,
        );
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
        globalThis.dispatchEvent(keyEvent);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(dialog?.showModal).toHaveBeenCalled();
      });

      it("closes modal when already open", ({ expect }) => {
        const openBtn =
          document.querySelector<HTMLButtonElement>("[data-open-modal]");
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
        globalThis.dispatchEvent(keyEvent);

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
        globalThis.dispatchEvent(keyEvent);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(dialog?.showModal).toHaveBeenCalled();
      });
    });

    describe("when Enter is pressed in search input", () => {
      it("blurs search input", ({ expect }) => {
        // Use the actual input element from the rendered layout
        const input = document.querySelector<HTMLInputElement>(
          "#pagefind-search-input",
        );
        expect(input).toBeTruthy();

        const blurSpy = vi.spyOn(input!, "blur");
        input!.focus();

        const keyEvent = new window.KeyboardEvent("keydown", {
          bubbles: true,
          key: "Enter",
        });
        Object.defineProperty(keyEvent, "target", {
          value: input,
          writable: false,
        });
        globalThis.dispatchEvent(keyEvent);

        expect(blurSpy).toHaveBeenCalled();
      });
    });

    describe("when clear button is clicked", () => {
      it("focuses search input", ({ expect }) => {
        // Use the actual elements from the rendered layout
        const clearBtn = document.querySelector<HTMLButtonElement>(
          "#pagefind-clear-button",
        );
        const searchInput = document.querySelector<HTMLInputElement>(
          "#pagefind-search-input",
        );

        expect(clearBtn).toBeTruthy();
        expect(searchInput).toBeTruthy();

        const focusSpy = vi.spyOn(searchInput!, "focus");

        // Open modal first to set up click listener
        const openBtn =
          document.querySelector<HTMLButtonElement>("[data-open-modal]");
        openBtn?.click();

        // Click the clear button
        const clickEvent = new window.MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperty(clickEvent, "target", {
          value: clearBtn,
          writable: false,
        });
        globalThis.dispatchEvent(clickEvent);

        expect(focusSpy).toHaveBeenCalled();
      });
    });
  });

  describe("search functionality", () => {
    let dom: JSDOMType;
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

      // Reset modules to clear search.ts state
      vi.resetModules();

      // Re-setup mocks after reset
      vi.mock("./search-ui", async () => {
        const actual =
          await vi.importActual<typeof import("./search-ui")>("./search-ui");
        return {
          ...actual,
          SearchUI: class extends actual.SearchUI {
            constructor() {
              super(mockSearchAPI as SearchAPI);
            }
          },
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

      // Render the test page using Astro's container API
      const renderers = await loadRenderers([reactContainerRenderer()]);
      const container = await AstroContainer.create({ renderers });

      const TestPageModule = (await import("./TestPage.astro")) as {
        default: AstroComponentFactory;
      };
      const TestPage = TestPageModule.default;

      const result = await container.renderToString(TestPage, {
        partial: false,
        request: new Request(`https://www.franksmovielog.com/test`),
      });

      // Create JSDOM instance with the rendered HTML
      dom = new JSDOM(result, {
        pretendToBeVisual: true,
        runScripts: "dangerously",
        url: "https://www.franksmovielog.com/test",
      });

      document = dom.window.document;
      window = dom.window;

      // Make JSDOM's window and document available globally
      globalThis.window = window as unknown as typeof globalThis & Window;
      globalThis.document = document;
      Object.defineProperty(globalThis, "navigator", {
        configurable: true,
        value: window.navigator,
        writable: true,
      });

      // Set up mocks
      globalThis.requestAnimationFrame = window.requestAnimationFrame;
      globalThis.requestIdleCallback =
        window.requestIdleCallback ||
        ((cb: IdleRequestCallback) => setTimeout(cb, 1));

      globalThis.addEventListener = window.addEventListener.bind(window);
      globalThis.removeEventListener = window.removeEventListener.bind(window);
      globalThis.dispatchEvent = window.dispatchEvent.bind(window);

      globalThis.HTMLInputElement = window.HTMLInputElement;
      globalThis.HTMLButtonElement = window.HTMLButtonElement;
      globalThis.AbortController = window.AbortController;

      vi.stubGlobal("import.meta.env", {
        BASE_URL: "/",
      });

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

      // Import and initialize search
      const { initPageFind } = await import("./search.ts");
      initPageFind();

      // Initialize user with fake timers AFTER DOM is set up
      user = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
        document,
      });

      cleanup = () => {
        delete document.body.dataset.searchModalOpen;
        const dialog = document.querySelector("dialog");
        if (dialog) {
          dialog.open = false;
        }
      };
    });

    afterEach(() => {
      cleanup();
      window.close();
      vi.clearAllMocks();
      vi.useRealTimers();
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
              url: "/test1",
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
              url: "/test2",
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
        const counter = document.querySelector("#pagefind-results-counter");
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
          const counter = document.querySelector("#pagefind-results-counter");
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
              url: "/test",
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

        // Verify results are shown
        await waitFor(() => {
          const results = queries.getByRole("region", {
            name: /search results/i,
          });
          expect(results.textContent).toContain("Test Title");
        });

        // Clear the input
        searchInput.value = "";
        searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));

        // Wait for debounce to process clear
        await vi.advanceTimersByTimeAsync(150);

        // Results should be cleared
        const resultsDiv = document.querySelector("#pagefind-results");
        expect(resultsDiv?.innerHTML).toBe("");

        const counter = document.querySelector("#pagefind-results-counter");
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

        const resultsDiv = document.querySelector("#pagefind-results");
        expect(resultsDiv?.innerHTML).toBe("");
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
            url: `/result${id}`,
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
          expect(
            loadMoreButton.parentElement?.classList.contains("hidden"),
          ).toBe(true);
        });
      });
    });
  });
});
