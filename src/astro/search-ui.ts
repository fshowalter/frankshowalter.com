import { debounce } from "~/utils/debounce";

import type { PagefindDocument, PagefindResult } from "./pagefind-api";

import { PagefindAPI } from "./pagefind-api";

export type SearchElements = {
  clearButton: HTMLButtonElement;
  container: HTMLElement;
  input: HTMLInputElement;
  loadMoreButton: HTMLButtonElement;
  loadMoreWrapper: HTMLElement;
  resultsContainer: HTMLElement;
  resultsCounter: HTMLElement;
};

// AIDEV-NOTE: Discriminated union makes invalid states unrepresentable.
// render() dispatches to one focused method per variant — no cross-branch conditionals.
type SearchState =
  | {
      allResults: PagefindResult[];
      kind: "results";
      query: string;
      results: PagefindDocument[];
      total: number;
      visibleCount: number;
    }
  | { kind: "empty"; query: string }
  | { kind: "error"; message: string }
  | { kind: "idle" }
  | { kind: "loading"; query: string };

/**
 * Search UI implementation
 */
export class SearchUI {
  private abortController: AbortController | undefined = undefined;
  private api: PagefindAPI;
  // Configuration
  private readonly config = {
    bundlePath: import.meta.env.BASE_URL.replace(/\/$/, "") + "/pagefind/",
    debounceTimeoutMs: 150,
    pageSize: 10,
    showImages: true,
  };
  // Debounced search function to prevent memory leak
  private readonly debouncedSearch: (query: string) => void;

  private elements: SearchElements;

  private state: SearchState = { kind: "idle" };

  constructor(elements: SearchElements, api?: PagefindAPI) {
    this.elements = elements;
    this.api = api || new PagefindAPI();

    // Create debounced search function once during construction
    this.debouncedSearch = debounce((query: string) => {
      void this.handleSearch(query);
    }, this.config.debounceTimeoutMs);
  }

  /**
   * Clean up the search UI
   */
  async destroy(): Promise<void> {
    // Abort any pending search
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }

    // Clean up the API
    await this.api.destroy();

    this.state = { kind: "idle" };
  }

  /**
   * Initialize the search UI
   */
  async init(): Promise<void> {
    this.setupEventListeners();

    try {
      await this.api.init(this.config.bundlePath);
    } catch (error) {
      console.error("Failed to initialize search API:", error);
      this.showError("Search functionality could not be loaded.");
    }
  }

  /**
   * Announce message to screen readers
   */
  private announceToScreenReader(message: string): void {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.append(announcement);
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }

  /**
   * Clear search
   */
  private clearSearch(): void {
    this.elements.input.value = "";
    this.elements.clearButton.classList.add("hidden");
    this.state = { kind: "idle" };
    this.render();
  }

  /**
   * Handle search
   */
  private async handleSearch(query: string): Promise<void> {
    // Cancel any existing search
    if (this.abortController) {
      this.abortController.abort();
    }

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      this.clearSearch();
      return;
    }

    // Create new abort controller for this search
    this.abortController = new AbortController();

    this.state = { kind: "loading", query: trimmedQuery };
    this.render();

    try {
      const searchResults = await this.api.search(trimmedQuery, {
        signal: this.abortController?.signal,
      });

      // Ignore if this search was aborted or controller was destroyed
      if (!this.abortController || this.abortController.signal.aborted) {
        return;
      }

      const resultData = await Promise.all(
        searchResults.results.slice(0, this.config.pageSize).map((r) => {
          return r.data();
        }),
      );

      this.state = resultData.length > 0 ? {
          allResults: searchResults.results,
          kind: "results",
          query: trimmedQuery,
          results: resultData,
          total: searchResults.results.length,
          visibleCount: resultData.length,
        } : { kind: "empty", query: trimmedQuery };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Search was cancelled, ignore
        return;
      }

      console.error("Search failed:", error);
      this.state = { kind: "error", message: "Search failed. Please try again." };
    }

    this.render();
  }

  /**
   * Load more results
   */
  private async loadMoreResults(): Promise<void> {
    if (this.state.kind !== "results") return;

    const { allResults, query, results, total, visibleCount } = this.state;
    const remaining = allResults.slice(visibleCount);
    if (remaining.length === 0) return;

    const nextBatch = remaining.slice(0, this.config.pageSize);
    const scrollPosition = this.elements.resultsContainer.scrollTop;

    try {
      const resultData = await Promise.all(
        nextBatch.map((r) => {
          return r.data();
        }),
      );

      this.state = {
        allResults,
        kind: "results",
        query,
        results: [...results, ...resultData],
        total,
        visibleCount: visibleCount + resultData.length,
      };
      this.render();

      // Restore scroll position
      this.elements.resultsContainer.scrollTop = scrollPosition;

      // Announce to screen readers that new results were loaded
      this.announceToScreenReader(`${resultData.length} more results loaded`);
    } catch (error) {
      console.error("Failed to load more results:", error);
      this.state = { kind: "error", message: "Failed to load more results." };
      this.render();
    }
  }

  /**
   * Dispatch rendering to the method for the current state.
   * Contains only a switch — no inline HTML, no conditionals.
   */
  private render(): void {
    switch (this.state.kind) {
      case "empty": {
        return this.renderEmpty();
      }
      case "error": {
        return this.renderError();
      }
      case "idle": {
        return this.renderIdle();
      }
      case "loading": {
        return this.renderLoading();
      }
      case "results": {
        return this.renderResultList();
      }
    }
  }

  private renderEmpty(): void {
    if (this.state.kind !== "empty") return;
    this.elements.resultsCounter.textContent = formatCounter(
      0,
      this.state.query,
    );
    this.elements.resultsContainer.innerHTML = `
      <div class="px-4 py-8 text-center font-sans text-sm text-subtle">
        No results found. Try adjusting your search terms.
      </div>
    `;
    this.elements.loadMoreWrapper.classList.add("hidden");
  }

  private renderError(): void {
    if (this.state.kind !== "error") return;
    this.elements.resultsCounter.textContent = "";
    this.elements.resultsContainer.innerHTML = `
      <div class="px-4 py-8 text-center font-sans text-sm text-subtle">
        ${this.state.message}
      </div>
    `;
    this.elements.loadMoreWrapper.classList.add("hidden");
  }

  private renderIdle(): void {
    this.elements.resultsCounter.textContent = "";
    this.elements.resultsContainer.innerHTML = "";
    this.elements.loadMoreWrapper.classList.add("hidden");
  }

  /**
   * Render loading skeleton
   */
  private renderLoading(): void {
    this.elements.resultsCounter.textContent = "";
    this.elements.resultsContainer.innerHTML = this.renderLoadingSkeleton();
    this.elements.loadMoreWrapper.classList.add("hidden");
  }

  /**
   * Render loading skeleton HTML
   */
  private renderLoadingSkeleton(): string {
    const skeletonItem = `
      <div class="animate-pulse px-4 py-4">
        <div class="gap-x-6 tablet:px-6 laptop:px-8 py-6 px-[8%] grid grid-cols-[min(25%,80px)_1fr]">
          ${
            this.config.showImages
              ? `
            <div class="h-12 w-full shrink-0 bg-subtle"></div>
          `
              : ""
          }
          <div class="min-w-0 flex-1">
            <div class="mb-2 h-5 w-3/4 bg-subtle"></div>
            <div class="h-3 w-full bg-subtle"></div>
            <div class="mt-1 h-3 w-5/6 bg-subtle"></div>
          </div>
        </div>
      </div>
    `;

    return Array.from({ length: 3 })
      .map(() => skeletonItem)
      .join("");
  }

  /**
   * Render a single result item
   */
  private renderResultItem(result: PagefindDocument): string {
    const { image, image_alt, title } = result.meta;
    const resultUrl = new URL(result.url);
    const imageUrl = `${resultUrl.protocol}//${resultUrl.hostname}/${image}`;

    return `
        <li class="relative transition-all gap-x-6 tablet:px-6 laptop:px-8 py-6 px-[8%] hover:bg-subtle border-t first-of-type:border-none border-border last-of-type:border-b grid grid-cols-[min(25%,80px)_1fr] focus-within:bg-subtle focus-within:outline-[rgb(38,132,255)] focus-within:outline-1 focus-within:-outline-offset-2">
          ${
            this.config.showImages && image
              ? `
            <div class="shrink-0 drop-shadow-md">
              <img
                src="${imageUrl}"
                alt="${image_alt || ""}"
                class="h-auto w-full"
                loading="lazy"
              >
            </div>
          `
              : ""
          }
          <div class="min-w-0 flex-1">
            <h3 class="font-serif text-base font-semibold text-default">
              <a href="${result.url}" class="block hover:text-accent after:absolute after:opacity-0 after:size-full">
                ${title}
              </a>
            </h3>
            <p class="text-sm leading-normal text-default">
              ${result.excerpt}
            </p>
          </div>
        </li>
    `;
  }

  /**
   * Render result list — only called in "results" state.
   * Owns load-more visibility since it only makes sense when results exist.
   */
  private renderResultList(): void {
    if (this.state.kind !== "results") return;
    const { allResults, query, results, total, visibleCount } = this.state;

    this.elements.resultsCounter.textContent = formatCounter(total, query);
    this.elements.resultsContainer.innerHTML = `<ol>${results
      .map((result) => this.renderResultItem(result))
      .join("")}</ol>`;

    const remaining = allResults.length - visibleCount;
    if (remaining > 0) {
      this.elements.loadMoreWrapper.classList.remove("hidden");
      this.elements.loadMoreButton.textContent = `Load ${Math.min(
        remaining,
        this.config.pageSize,
      )} more (${total - visibleCount} remaining)`;
    } else {
      this.elements.loadMoreWrapper.classList.add("hidden");
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    const { clearButton, input, loadMoreButton } = this.elements;

    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;

      // Show/hide clear button based on input content
      clearButton.classList.toggle("hidden", !target.value);

      this.debouncedSearch(target.value);
    });

    // Clear button
    clearButton.addEventListener("click", () => {
      this.clearSearch();
      input.focus();
    });

    // Load more button
    loadMoreButton.addEventListener("click", () => {
      void this.loadMoreResults();
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.state = { kind: "error", message };
    this.render();
  }
}

/**
 * Format the results counter text.
 * Pure function — exported for unit testing.
 */
export function formatCounter(total: number, query: string): string {
  if (total === 0) return `No results for "${query}"`;
  if (total === 1) return `1 result for "${query}"`;
  return `${total} results for "${query}"`;
}
