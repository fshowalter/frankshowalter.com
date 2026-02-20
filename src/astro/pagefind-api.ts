export type PagefindDocument = {
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

export type PagefindResult = {
  data(): Promise<PagefindDocument>;
  id: string;
  score: number;
  words: number[];
};

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

// AIDEV-NOTE: `Pagefind` is the raw imported library interface; `PagefindAPI` is the wrapper class.
type Pagefind = {
  destroy(): Promise<void>;
  filters(): Promise<Record<string, Record<string, number>>>;
  init(): Promise<void>;
  preload(term: string, options?: PagefindSearchOptions): Promise<void>;
  search(
    query: string,
    options?: PagefindSearchOptions,
  ): Promise<PagefindSearchResults>;
};

type PagefindAnchor = {
  element: string;
  id: string;
  location: number;
  text: string;
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

type WeightedLocation = {
  balanced_score: number;
  location: number;
  weight: number;
};

/**
 * Wrapper for the Pagefind search API.
 * Handles index merging for franksmovielog.com and franksbooklog.com.
 */
export class PagefindAPI {
  private api: Pagefind | undefined = undefined;
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
      )) as Pagefind & {
        mergeIndex: (url: string, options: { baseUrl: string }) => void;
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
    options?: PagefindSearchOptions,
  ): Promise<PagefindSearchResults> {
    if (!this.api) {
      throw new Error("Search API not initialized");
    }

    return this.api.search(query, options);
  }
}
