import { debounce } from "~/utils/debounce";

/**
 * Search results returned by Pagefind API.
 */
export type PagefindSearchResults = {
  filters: Record<string, Record<string, number>>;
  results: PagefindResult[];
  timings: {
    preload: number;
    search: number;
    total: number;
  };
  totalFilters: Record<string, Record<string, number>>;
  unfilteredResultCount: number;
};

type PagefindAnchor = {
  element: string;
  id: string;
  location: number;
  text: string;
};

// Types for Pagefind API
type PagefindAPI = {
  debouncedSearch(
    query: string,
    options?: PagefindSearchOptions,
    debounceTimeoutMs?: number,
  ): Promise<PagefindSearchResults>;
  destroy(): Promise<void>;
  filters(): Promise<Record<string, Record<string, number>>>;
  init(): Promise<void>;
  preload(term: string, options?: PagefindSearchOptions): Promise<void>;
  search(
    query: string,
    options?: PagefindSearchOptions,
  ): Promise<PagefindSearchResults>;
};

type PagefindDocument = {
  anchors?: PagefindAnchor[];
  excerpt: string;
  filters: Record<string, string>;
  meta: {
    image?: string;
    image_alt?: string;
    title: string;
  };
  sub_results?: PagefindSubResult[];
  url: string;
  weighted_locations: WeightedLocation[];
};

type PagefindResult = {
  data(): Promise<PagefindDocument>;
  id: string;
  score: number;
  words: number[];
};

type PagefindSearchOptions = {
  filters?: Record<string, string | string[]>;
  sort?: Record<string, "asc" | "desc">;
  verbose?: boolean;
};

type PagefindSubResult = {
  anchor?: PagefindAnchor;
  excerpt: string;
  title: string;
  url: string;
  weighted_locations: WeightedLocation[];
};

type SearchElements = {
  clearButton: HTMLButtonElement;
  container: HTMLElement;
  input: HTMLInputElement;
  loadMoreButton: HTMLButtonElement;
  loadMoreWrapper: HTMLElement;
  resultsContainer: HTMLElement;
  resultsCounter: HTMLElement;
};

// Types for Search UI
type SearchState = {
  error: string | undefined;
  filters: Record<string, Record<string, number>>;
  hasSearched: boolean;
  isSearching: boolean;
  query: string;
  results: PagefindDocument[];
  selectedFilters: Record<string, string[]>;
  totalResults: number;
  visibleResults: number;
};

type WeightedLocation = {
  balanced_score: number;
  location: number;
  weight: number;
};

/**
 * Wrapper for the Pagefind search API
 */
export class SearchAPI {
  private api: PagefindAPI | undefined = undefined;
  private isInitialized = false;

  /**
   * Clean up the API
   */
  async destroy(): Promise<void> {
    if (this.api) {
      await this.api.destroy();
      this.api = undefined;
      this.isInitialized = false;
    }
  }

  /**
   * Initialize the Pagefind API
   */
  async init(bundlePath: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamically import Pagefind with proper typing
      const pagefindModule = (await import(
        /* @vite-ignore */ `${bundlePath}pagefind.js`
      )) as PagefindAPI & {
        mergeIndex: (url: string, options: { baseUrl: string }) => void;
        options: (config: {
          baseUrl: string;
          bundlePath: string;
        }) => Promise<void>;
      };

      pagefindModule.mergeIndex("/pagefind-movielog", {
        baseUrl: "https://www.franksmovielog.com/",
      });
      pagefindModule.mergeIndex("/pagefind-booklog", {
        baseUrl: "https://www.franksbooklog.com/",
      });

      // Store the API reference
      this.api = pagefindModule;

      // Initialize the API
      await this.api.init();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Pagefind:", error);
      throw new Error("Search functionality could not be loaded");
    }
  }

  /**
   * Perform a search
   */
  async search(
    query: string,
    options?: PagefindSearchOptions & { signal?: AbortSignal },
  ): Promise<PagefindSearchResults> {
    if (!this.api) {
      throw new Error("Search API not initialized");
    }

    // Extract signal from options
    const { signal, ...searchOptions } = options || {};

    // Create a promise that rejects on abort
    const abortPromise = signal
      ? new Promise<never>((_, reject) => {
          signal.addEventListener("abort", () => {
            reject(new DOMException("Search aborted", "AbortError"));
          });
        })
      : undefined;

    // Race between search and abort
    const searchPromise = this.api.debouncedSearch
      ? this.api.debouncedSearch(query, searchOptions, 0)
      : this.api.search(query, searchOptions);

    if (abortPromise) {
      return Promise.race([searchPromise, abortPromise]);
    }

    return searchPromise;
  }
}

/**
 * Search UI implementation
 */
export class SearchUI {
  private abortController: AbortController | undefined = undefined;
  private api: SearchAPI;
  // Configuration
  private readonly config = {
    bundlePath: import.meta.env.BASE_URL.replace(/\/$/, "") + "/pagefind/",
    debounceTimeoutMs: 150,
    pageSize: 10,
    resultsText: {
      many_results: '[COUNT] results for "[SEARCH_TERM]"',
      one_result: '[COUNT] result for "[SEARCH_TERM]"',
      zero_results: 'No results for "[SEARCH_TERM]"',
    },
    showImages: true,
  };
  private currentSearchResults: PagefindResult[] = [];
  // Debounced search function to prevent memory leak
  private readonly debouncedSearch: (query: string) => void;

  private elements: SearchElements | undefined = undefined;

  private state: SearchState;

  constructor(api?: SearchAPI) {
    this.api = api || new SearchAPI();
    this.state = this.getInitialState();

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

    // Clear results
    this.currentSearchResults = [];
    this.state = this.getInitialState();
  }

  /**
   * Initialize the search UI
   */
  async init(): Promise<void> {
    try {
      this.setupElements();
    } catch {
      // Search elements not found - likely in test environment or page without search
      return;
    }

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
    if (!this.elements) return;

    this.elements.input.value = "";
    this.elements.clearButton.classList.add("hidden");
    this.updateState(this.getInitialState());
    // Clear stored results when clearing search
    this.currentSearchResults = [];
    this.renderResults();
  }

  /**
   * Get initial state
   */
  private getInitialState(): SearchState {
    return {
      error: undefined,
      filters: {},
      hasSearched: false,
      isSearching: false,
      query: "",
      results: [],
      selectedFilters: {},
      totalResults: 0,
      visibleResults: 0,
    };
  }

  // Get remaining results from current search
  private getRemainingResults(): PagefindResult[] {
    // Return results that haven't been displayed yet
    return this.currentSearchResults.slice(this.state.visibleResults);
  }

  /**
   * Handle search
   */
  private async handleSearch(query: string): Promise<void> {
    if (!this.elements) return;

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

    this.updateState({
      error: undefined,
      hasSearched: true,
      isSearching: true,
    });
    this.renderResults();

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

      // Store the full results array for "load more" functionality
      this.currentSearchResults = searchResults.results;

      this.updateState({
        filters: searchResults.filters,
        isSearching: false,
        results: resultData,
        totalResults: searchResults.results.length,
        visibleResults: resultData.length,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Search was cancelled, ignore
        return;
      }

      console.error("Search failed:", error);
      this.updateState({
        error: "Search failed. Please try again.",
        isSearching: false,
      });
    }

    this.renderResults();
  }

  /**
   * Load more results
   */
  private async loadMoreResults(): Promise<void> {
    if (!this.elements) return;

    const remainingResults = this.getRemainingResults();
    if (remainingResults.length === 0) return;

    const nextBatch = remainingResults.slice(0, this.config.pageSize);
    const scrollPosition = this.elements.resultsContainer.scrollTop;

    try {
      const resultData = await Promise.all(
        nextBatch.map((r) => {
          return r.data();
        }),
      );

      this.updateState({
        results: [...this.state.results, ...resultData],
        visibleResults: this.state.visibleResults + resultData.length,
      });
      this.renderResults();

      // Restore scroll position
      this.elements.resultsContainer.scrollTop = scrollPosition;

      // Announce to screen readers that new results were loaded
      const announcement = `${resultData.length} more results loaded`;
      this.announceToScreenReader(announcement);
    } catch (error) {
      console.error("Failed to load more results:", error);
      this.showError("Failed to load more results.");
    }
  }

  /**
   * Render loading skeleton
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

    return `
        <li class="relative transition-all gap-x-6 tablet:px-6 laptop:px-8 py-6 px-[8%] hover:bg-subtle border-t first-of-type:border-none border-default last-of-type:border-b grid grid-cols-[min(25%,80px)_1fr] focus-within:bg-subtle focus-within:outline-[rgb(38,132,255)] focus-within:outline-1 focus-within:-outline-offset-2">
          ${
            this.config.showImages && image
              ? `
            <div class="shrink-0 drop-shadow-md">
              <img 
                src="${image}" 
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
   * Render search results
   */
  private renderResults(): void {
    if (!this.elements) return;

    const {
      error,
      hasSearched,
      isSearching,
      query,
      results,
      totalResults,
      visibleResults,
    } = this.state;

    // Update results counter
    if (hasSearched && !isSearching) {
      let counterText = "";
      if (totalResults === 0) {
        counterText = this.config.resultsText.zero_results;
      } else if (totalResults === 1) {
        counterText = this.config.resultsText.one_result;
      } else {
        counterText = this.config.resultsText.many_results;
      }

      counterText = counterText
        .replace("[COUNT]", totalResults.toString())
        .replace("[SEARCH_TERM]", query);

      this.elements.resultsCounter.textContent = counterText;
    } else {
      this.elements.resultsCounter.textContent = "";
    }

    // Update results container
    if (error) {
      this.elements.resultsContainer.innerHTML = `
        <div class="px-4 py-8 text-center font-sans text-sm text-subtle">
          ${error}
        </div>
      `;
    } else if (isSearching) {
      this.elements.resultsContainer.innerHTML = this.renderLoadingSkeleton();
    } else if (results.length > 0) {
      this.elements.resultsContainer.innerHTML = `<ol>${results
        .map((result) => this.renderResultItem(result))
        .join("")}</ol>`;
    } else if (hasSearched) {
      this.elements.resultsContainer.innerHTML = `
        <div class="px-4 py-8 text-center font-sans text-sm text-subtle">
          No results found. Try adjusting your search terms.
        </div>
      `;
    } else {
      this.elements.resultsContainer.innerHTML = "";
    }

    // Show/hide load more button
    const remainingResults = this.getRemainingResults();
    if (remainingResults.length > 0 && !isSearching) {
      this.elements.loadMoreWrapper.classList.remove("hidden");
      this.elements.loadMoreButton.textContent = `Load ${Math.min(
        remainingResults.length,
        this.config.pageSize,
      )} more (${totalResults - visibleResults} remaining)`;
    } else {
      this.elements.loadMoreWrapper.classList.add("hidden");
    }
  }

  /**
   * Set up DOM elements
   */
  private setupElements(): void {
    // AIDEV-NOTE: Using IDs from AstroPageShell.astro
    this.elements = {
      clearButton: document.querySelector(
        "#pagefind-clear-button",
      ) as HTMLButtonElement,
      container: document.body,
      input: document.querySelector(
        "#pagefind-search-input",
      ) as HTMLInputElement,
      loadMoreButton: document.querySelector(
        "#pagefind-load-more",
      ) as HTMLButtonElement,
      loadMoreWrapper: document.querySelector(
        "#pagefind-load-more-wrapper",
      ) as HTMLElement,
      resultsContainer: document.querySelector(
        "#pagefind-results",
      ) as HTMLElement,
      resultsCounter: document.querySelector(
        "#pagefind-results-counter",
      ) as HTMLElement,
    };

    if (!this.elements.input || !this.elements.resultsContainer) {
      throw new Error("Required search elements not found");
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (!this.elements) return;

    const { clearButton, input, loadMoreButton } = this.elements;

    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.updateState({ query: target.value });

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
    this.updateState({
      error: message,
      isSearching: false,
    });
    this.renderResults();
  }

  /**
   * Update component state
   */
  private updateState(updates: Partial<SearchState>): void {
    this.state = { ...this.state, ...updates };
  }
}
